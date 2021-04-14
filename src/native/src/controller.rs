#[cfg(windows)]
use vigem::*;

pub enum JoystickDirection {
    Up,
    Down,
    Left,
    Right,
}

pub struct JoystickState {
    up: bool,
    down: bool,
    left: bool,
    right: bool,
}

mod utils {
    /// Accepts x,y as values between -1 -> 1
    pub fn process_circular_direction(x: f32, y: f32, d_param: f32) -> (f32, f32) {
        if x == 0.0 && y == 0.0 {
            return (0.0, 0.0);
        }

        let k_m = f32::max(x.abs(), y.abs());

        let d_x = x * d_param;
        let d_y = y * (1.0 - d_param);

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

    pub fn float_to_xusb_js_axis(value: f32) -> i16 {
        let mut value = (value.max(-1.0).min(1.0) * 32767.0) as i16;
        if value < i16::MIN + 10 {
            value = i16::MIN;
        }

        value
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

    pub fn set_direction_state(&mut self, direction: JoystickDirection, state: bool) {
        match direction {
            JoystickDirection::Up => self.up = state,
            JoystickDirection::Down => self.down = state,
            JoystickDirection::Left => self.left = state,
            JoystickDirection::Right => self.right = state,
        }
    }

    pub fn get_xusb_direction_basic(&self) -> (i16, i16) {
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

    pub fn get_xusb_direction(&self) -> (i16, i16) {
        let mut x: f32 = 0.0;
        let mut y: f32 = 0.0;

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

        let (x, y) = utils::process_circular_direction(x, y, 0.67);

        (
            utils::float_to_xusb_js_axis(x),
            utils::float_to_xusb_js_axis(y),
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
    pub fn get_xusb_report(&self) -> XUSBReport {
        let (lx, ly) = self.left_joystick.get_xusb_direction();
        let (rx, ry) = self.right_joystick.get_xusb_direction();
        XUSBReport {
            s_thumb_lx: lx,
            s_thumb_ly: ly,
            s_thumb_rx: rx,
            s_thumb_ry: ry,
            ..XUSBReport::default()
        }
    }
}
