use crate::config::{JoystickAngleConfiguration, JoystickKeyMapping};
#[allow(unused_imports)]
use log::*;
#[cfg(windows)]
use vigem::{DSReport, XUSBReport};
#[cfg(windows)]
use winapi::um::winuser::GetAsyncKeyState;

pub enum JoystickDirection {
    Up,
    UpTwo,
    Down,
    DownTwo,
    Left,
    LeftTwo,
    Right,
    RightTwo,
} 

#[derive(Debug)]
pub struct JoystickState {
    up: bool,
    up_two: bool,
    down: bool,
    down_two: bool,
    left: bool,
    left_two: bool,
    right: bool,
    right_two: bool
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
        let value = (value.max(-1.0).min(1.0) * 127.0) + 127.0;
        if value > (u8::MAX - 2) as f32 {
            return u8::MAX;
        }
        value as u8
    }
}

impl JoystickState {
    pub fn new() -> Self {
        Self {
            up: false,
            up_two: false,
            down: false,
            down_two: false,
            left: false,
            left_two: false,
            right: false,
            right_two: false,
        }
    }

    pub fn set_direction_state(&mut self, direction: JoystickDirection, state: bool) -> bool {
        match direction {
            JoystickDirection::Up => self.up.update(state),
            JoystickDirection::UpTwo => self.up_two.update(state),
            JoystickDirection::Down => self.down.update(state),
            JoystickDirection::DownTwo => self.down_two.update(state),
            JoystickDirection::Left => self.left.update(state),
            JoystickDirection::LeftTwo => self.left_two.update(state),
            JoystickDirection::Right => self.right.update(state),
            JoystickDirection::RightTwo => self.right_two.update(state),
        }
    }

    #[allow(dead_code)]
    pub fn update_key_state(&mut self, direction: JoystickDirection, binding: u8) -> bool {
        #[cfg(windows)]
        {
            let state = unsafe { GetAsyncKeyState(binding as i32) as u32 };
            self.set_direction_state(direction, state & 0x8000 != 0)
        }
        #[cfg(not(windows))]
        false
    }

    #[allow(dead_code)]
    pub fn update_key_states(&mut self, mappings: &JoystickKeyMapping) -> bool {
        self.update_key_state(JoystickDirection::Up, mappings.up)
            | self.update_key_state(JoystickDirection::UpTwo, mappings.up_two)
            | self.update_key_state(JoystickDirection::Down, mappings.down)
            | self.update_key_state(JoystickDirection::DownTwo, mappings.down_two)
            | self.update_key_state(JoystickDirection::Left, mappings.left)
            | self.update_key_state(JoystickDirection::LeftTwo, mappings.left_two)
            | self.update_key_state(JoystickDirection::Right, mappings.right)
            | self.update_key_state(JoystickDirection::RightTwo, mappings.right_two)
    }

    pub fn _get_xusb_direction_basic(&self) -> (i16, i16) {
        let mut x: i16 = 0;
        let mut y: i16 = 0;

        if (self.down || self.down_two) && !(self.up || self.up_two) {
            y = i16::MIN;
        } else if (self.up || self.up_two) && !(self.down || self.down_two) {
            y = i16::MAX;
        }

        if (self.left || self.left_two) && !(self.right || self.right_two) {
            x = i16::MIN;
        } else if (self.right || self.right_two) && !(self.left || self.left_two) {
            x = i16::MAX;
        }

        (x, y)
    }

    pub fn get_basic_direction(&self, config: Option<&JoystickAngleConfiguration>) -> (f32, f32) {
        let mut x: f32 = 0.0;
        let mut y: f32 = 0.0;

        if (self.down || self.down_two) && !(self.up || self.up_two) {
            y = -1.0;
        } else if (self.up || self.up_two) && !(self.down || self.down_two) {
            y = 1.0;
        }

        if (self.left || self.left_two) && !(self.right || self.right_two) {
            x = -1.0;
        } else if (self.right || self.right_two) && !(self.left || self.left_two) {
            x = 1.0;
        }

        let (x, y) = utils::process_circular_direction(
            x,
            y,
            config.map(|v| v.right_up_angle).unwrap_or(0.67),
        );

        (x, y)
    }

    #[allow(dead_code)]
    pub fn get_xusb_direction(&self, config: Option<&JoystickAngleConfiguration>) -> (i16, i16) {
        let (x, y) = self.get_basic_direction(config);

        (
            utils::float_to_xusb_js_axis(x),
            utils::float_to_xusb_js_axis(y),
        )
    }

    #[allow(dead_code)]
    pub fn get_ds4_direction(&self, config: Option<&JoystickAngleConfiguration>) -> (u8, u8) {
        let (x, y) = self.get_basic_direction(config);

        (
            utils::float_to_ds4_js_axis(x),
            255 - utils::float_to_ds4_js_axis(y),
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
    pub fn get_xusb_report(
        &self,
        left_joystick: Option<&JoystickAngleConfiguration>,
    ) -> XUSBReport {
        let (lx, ly) = self.left_joystick.get_xusb_direction(left_joystick);
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
    pub fn get_ds4_report(&self, left_joystick: Option<&JoystickAngleConfiguration>) -> DSReport {
        let (lx, ly) = self.left_joystick.get_ds4_direction(left_joystick);
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
