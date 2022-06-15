#[allow(unused_imports)]
use log::*;
#[cfg(windows)]
use vigem::{DS4Button, DSReport, XUSBReport};
#[cfg(windows)]
use winapi::um::winuser::GetAsyncKeyState;

use crate::config::{JoystickAngleConfiguration, JoystickKeyMapping};

pub enum JoystickDirection {
    Up,
    Down,
    Left,
    Right,
}

#[derive(Debug)]
struct JoystickDirectionState(f32);

impl JoystickDirectionState {
    pub fn new() -> Self {
        JoystickDirectionState(0.0)
    }

    pub fn update_analog(&mut self, value: f32) -> bool {
        if value != self.0 {
            self.0 = value;
            true
        } else {
            false
        }
    }

    pub fn update_digital(&mut self, value: bool) -> bool {
        self.update_analog(if value { 1.0 } else { 0.0 })
    }

    pub fn get(&self) -> f32 {
        self.0
    }

    pub fn get_with_range(&self, analog_range: &(f32, f32)) -> f32 {
        let range_start = analog_range.0;
        let range_end = analog_range.1;
        let value = self.0;
        if value <= range_start {
            0.0
        } else if value > range_end {
            1.0
        } else {
            (value - range_start) / (range_end - range_start)
        }
    }
}

#[derive(Debug)]
pub struct JoystickState {
    up: JoystickDirectionState,
    down: JoystickDirectionState,
    left: JoystickDirectionState,
    right: JoystickDirectionState,
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
    pub fn process_circular_direction(
        x: f32,
        y: f32,
        d_param: f32,
        horizontal_angle: Option<f32>,
    ) -> (f32, f32) {
        if x == 0.0 && y == 0.0 {
            return (0.0, 0.0);
        }

        // The factors that adjust the angles of the joystick output
        // Convert the d_param from 0->1 to -1 -> 1
        // We do the check with y to make sure we're not applying this when we're moving backwards
        let s_d = if y > 0.0 { (d_param * 2.0) - 1.0 } else { 0.0 };

        // The input number for this is 0->1 which corresponds to the 2 -> 0 range of this parameter, so we need to convert
        let s_y = horizontal_angle.map(|v| (1.0 - v) * 2.0).unwrap_or(0.0);

        let k_x = x;
        let k_y = y;

        let k_a_x = f32::abs(k_x);
        let k_a_y = f32::abs(k_y);

        let k_p_x = if k_x == 0.0 { 1.0 } else { k_x / k_a_x };
        let k_p_y = if k_y == 0.0 { 1.0 } else { k_y / k_a_y };

        let r = {
            if k_a_x > k_a_y {
                (k_a_y * (1f32 - s_d - s_y * k_p_y) + s_y * k_p_y * k_a_x) / k_a_x
            } else {
                (k_a_x * (s_d + 1f32)) / k_a_y
            }
        };

        let d_x: f32;
        let d_y: f32;
        let pi_4 = std::f32::consts::FRAC_PI_4;
        if k_a_x > k_a_y {
            // D1
            d_x = k_p_x * f32::cos(r * pi_4);
            d_y = k_p_y * f32::sin(r * pi_4);
        } else {
            // D2
            d_x = k_p_x * f32::sin(r * pi_4);
            d_y = k_p_y * f32::cos(r * pi_4);
        }

        // let max_k_a = f32::max(k_a_x, k_a_y);
        let max_k_a = 1.0;

        let out_x = max_k_a * d_x;
        let out_y = max_k_a * d_y;

        (out_x, out_y)
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
            up: JoystickDirectionState::new(),
            down: JoystickDirectionState::new(),
            left: JoystickDirectionState::new(),
            right: JoystickDirectionState::new(),
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

    pub fn set_direction_state_digital(
        &mut self,
        direction: JoystickDirection,
        state: bool,
    ) -> bool {
        match direction {
            JoystickDirection::Up => self.up.update_digital(state),
            JoystickDirection::Down => self.down.update_digital(state),
            JoystickDirection::Left => self.left.update_digital(state),
            JoystickDirection::Right => self.right.update_digital(state),
        }
    }
    pub fn set_direction_state_analog(&mut self, direction: JoystickDirection, state: f32) -> bool {
        match direction {
            JoystickDirection::Up => self.up.update_analog(state),
            JoystickDirection::Down => self.down.update_analog(state),
            JoystickDirection::Left => self.left.update_analog(state),
            JoystickDirection::Right => self.right.update_analog(state),
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
        self.set_direction_state_digital(direction, key_state)
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

    pub fn get_basic_direction(&self, config: Option<&JoystickAngleConfiguration>) -> (f32, f32) {
        if config.is_none() {
            return (0.0, 0.0);
        }

        let config = config.unwrap();

        let x: f32;
        let y: f32;

        let angle: f32 = config.up_diagonal_angle;

        let is_advanced_strafe_on: bool = config.use_left_right_angle;
        let left_right_angle = if is_advanced_strafe_on {
            config.left_right_angle
        } else {
            1.0
        };

        let analog_range = config.analog_range;

        let up = self.up.get_with_range(&analog_range);
        let down = self.down.get_with_range(&analog_range);
        let left = self.left.get_with_range(&analog_range);
        let right = self.right.get_with_range(&analog_range);

        if down > up {
            y = -down;
        } else {
            y = up;
        }

        if left > right {
            x = -left;
        } else {
            x = right;
        }

        utils::process_circular_direction(x, y, angle, Some(left_right_angle))
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
    pub fn get_xusb_report_from_axis(&self, x: f32, y: f32) -> XUSBReport {
        let (lx, ly) = (
            utils::float_to_xusb_js_axis(x),
            utils::float_to_xusb_js_axis(y),
        );
        let (rx, ry) = (
            utils::float_to_xusb_js_axis(0.0),
            utils::float_to_xusb_js_axis(0.0),
        );
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
    pub fn get_xusb_report(&self, config: Option<&JoystickAngleConfiguration>) -> XUSBReport {
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
    pub fn get_ds4_report_from_axis(&self, x: f32, y: f32) -> DSReport {
        let (lx, ly) = (
            utils::float_to_ds4_js_axis(x),
            utils::float_to_ds4_js_axis(-y),
        );
        let (rx, ry) = (
            utils::float_to_ds4_js_axis(0.0),
            utils::float_to_ds4_js_axis(0.0),
        );
        DSReport {
            b_thumb_lx: lx,
            b_thumb_ly: ly,
            b_thumb_rx: rx,
            b_thumb_ry: ry,
            ..DSReport::default()
        }
    }

    #[cfg(windows)]
    #[allow(dead_code)]
    pub fn get_ds4_report(&self, config: Option<&JoystickAngleConfiguration>) -> DSReport {
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
