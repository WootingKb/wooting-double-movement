#[allow(unused_imports)]
use log::*;
#[cfg(windows)]
use vigem::{DSReport, XUSBReport};
#[cfg(windows)]
use winapi::um::winuser::GetAsyncKeyState;

use crate::config::{JoystickKeyMapping, ServiceConfiguration};

pub enum JoystickDirection {
    Up,
    Down,
    Left,
    Right,
}

#[derive(Debug)]
pub struct JoystickState {
    up: bool,
    down: bool,
    left: bool,
    right: bool,
}

trait UpdateValue {
    fn update(&mut self, value: Self) -> bool;
}

impl UpdateValue for bool {
    fn update(&mut self, value: bool) -> bool {
        if *self != value {
            *self = value;
            true
        } else {
            false
        }
    }
}

mod utils {
    /// Accepts x,y as values between -1 -> 1
    pub fn process_circular_direction(x: f32, y: f32, d_param: f32) -> (f32, f32) {
        if x == 0.0 && y == 0.0 {
            return (0.0, 0.0);
        }

        let k_m = f32::max(x.abs(), y.abs());

        let use_d = if y < 0.0 { 0.5 } else { d_param };

        let d_x = x * use_d;
        let d_y = y * (1.0 - use_d);

        let d_m = f32::sqrt(d_x * d_x + d_y * d_y);

        let mut dn_x = 0.0;
        let mut dn_y = 0.0;

        if d_m != 0.0 {
            dn_x = d_x / d_m;
            dn_y = d_y / d_m;
        }

        let p_x = k_m * dn_x;
        let p_y = k_m * dn_y;

        (p_x, p_y)
    }

    #[allow(dead_code)]
    pub fn float_to_xusb_js_axis(value: f32) -> i16 {
        let mut value = (value.max(-1.0).min(1.0) * 32767.0) as i16;
        if value < i16::MIN + 10 {
            value = i16::MIN;
        }

        value
    }

    #[allow(dead_code)]
    pub fn float_to_ds4_js_axis(value: f32) -> u8 {
        let value = (value.max(-1.0).min(1.0) * 127.0) + 128.0;
        if value >= (u8::MAX - 1) as f32 {
            return u8::MAX;
        }

        if value <= (u8::MIN + 1) as f32 {
            return u8::MIN;
        }

        value as u8
    }
}

impl JoystickState {
    pub fn new() -> Self {
        Self {
            up: false,
            down: false,
            left: false,
            right: false,
        }
    }

    pub fn get_key_state(&mut self, bind: u8) -> bool {
        #[cfg(windows)]
        {
            let state = unsafe { GetAsyncKeyState(bind as i32) as u32 };
            state & 0x8000 != 0
        }
        #[cfg(not(windows))]
        false
    }

    pub fn set_direction_state(&mut self, direction: JoystickDirection, state: bool) -> bool {
        match direction {
            JoystickDirection::Up => self.up.update(state),
            JoystickDirection::Down => self.down.update(state),
            JoystickDirection::Left => self.left.update(state),
            JoystickDirection::Right => self.right.update(state),
        }
    }

    #[allow(dead_code)]
    pub fn update_key_state(
        &mut self,
        direction: JoystickDirection,
        bind_one: Option<&u8>,
        bind_two: Option<&u8>,
    ) -> bool {
        let mut key_state = false;
        if let Some(bind_one) = bind_one {
            key_state |= self.get_key_state(*bind_one);
        }
        if let Some(bind_two) = bind_two {
            key_state |= self.get_key_state(*bind_two);
        }
        self.set_direction_state(direction, key_state)
    }

    #[allow(dead_code)]
    pub fn update_key_states(&mut self, mappings: &JoystickKeyMapping) -> bool {
        self.update_key_state(
            JoystickDirection::Up,
            mappings.up.as_ref(),
            mappings.up_two.as_ref(),
        ) | self.update_key_state(
            JoystickDirection::Down,
            mappings.down.as_ref(),
            mappings.down_two.as_ref(),
        ) | self.update_key_state(
            JoystickDirection::Left,
            mappings.left.as_ref(),
            mappings.left_two.as_ref(),
        ) | self.update_key_state(
            JoystickDirection::Right,
            mappings.right.as_ref(),
            mappings.right_two.as_ref(),
        )
    }

    pub fn _get_xusb_direction_basic(&self) -> (i16, i16) {
        let mut x: i16 = 0;
        let mut y: i16 = 0;

        if self.down && !self.up {
            y = i16::MIN;
        } else if self.up && !self.down {
            y = i16::MAX;
        }

        if self.left && !self.right {
            x = i16::MIN;
        } else if self.right && !self.left {
            x = i16::MAX;
        }

        (x, y)
    }

    pub fn get_basic_direction(&self, config: Option<&ServiceConfiguration>) -> (f32, f32) {
        let mut x: f32 = 0.0;
        let mut y: f32 = 0.0;

        let mut angle: f32 = config
            .map(|v| v.left_joystick_strafing_angles.right_up_angle)
            .unwrap_or(0.67);

        let is_advanced_strafe_on: bool = config.map(|v| v.is_advanced_strafe_on).unwrap_or(false);

        if self.down && !self.up {
            y = -1.0;
        } else if self.up && !self.down {
            y = 1.0;
        }

        if self.left && !self.right {
            x = -1.0;
        } else if self.right && !self.left {
            x = 1.0;
        }

        if is_advanced_strafe_on && self.left && !self.up && !self.down && !self.right {
            y = 1.0;
            x = -1.0;
            angle = config
                .map(|v| v.left_joystick_single_key_strafing_angles.right_up_angle)
                .unwrap_or(0.78);
        } else if is_advanced_strafe_on && self.right && !self.up && !self.down && !self.left {
            y = 1.0;
            x = 1.0;
            angle = config
                .map(|v| v.left_joystick_single_key_strafing_angles.right_up_angle)
                .unwrap_or(0.78);
        }

        let (x, y) = utils::process_circular_direction(x, y, angle);
        (x, y)
    }

    #[allow(dead_code)]
    pub fn get_xusb_direction(&self, config: Option<&ServiceConfiguration>) -> (i16, i16) {
        let (x, y) = self.get_basic_direction(config);

        (
            utils::float_to_xusb_js_axis(x),
            utils::float_to_xusb_js_axis(y),
        )
    }

    #[allow(dead_code)]
    pub fn get_ds4_direction(&self, config: Option<&ServiceConfiguration>) -> (u8, u8) {
        let (x, y) = self.get_basic_direction(config);
        (
            utils::float_to_ds4_js_axis(x),
            utils::float_to_ds4_js_axis(-y),
        )
    }
}

pub struct ControllerState {
    pub left_joystick: JoystickState,
    pub right_joystick: JoystickState,
}

impl ControllerState {
    pub fn new() -> Self {
        Self {
            left_joystick: JoystickState::new(),
            right_joystick: JoystickState::new(),
        }
    }

    #[cfg(windows)]
    #[allow(dead_code)]
    pub fn get_xusb_report(&self, config: Option<&ServiceConfiguration>) -> XUSBReport {
        let (lx, ly) = self.left_joystick.get_xusb_direction(config);
        let (rx, ry) = self.right_joystick.get_xusb_direction(None);
        XUSBReport {
            s_thumb_lx: lx,
            s_thumb_ly: ly,
            s_thumb_rx: rx,
            s_thumb_ry: ry,
            ..XUSBReport::default()
        }
    }

    #[cfg(windows)]
    #[allow(dead_code)]
    pub fn get_ds4_report(&self, config: Option<&ServiceConfiguration>) -> DSReport {
        let (lx, ly) = self.left_joystick.get_ds4_direction(config);
        let (rx, ry) = self.right_joystick.get_ds4_direction(None);
        DSReport {
            b_thumb_lx: lx,
            b_thumb_ly: ly,
            b_thumb_rx: rx,
            b_thumb_ry: ry,
            ..DSReport::default()
        }
    }
}
