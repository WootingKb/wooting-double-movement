use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct JoystickAngleConfiguration {
    #[serde(rename = "leftUpAngle")]
    pub left_up_angle: f32,
    #[serde(rename = "rightUpAngle")]
    pub right_up_angle: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceConfiguration {
    #[serde(rename = "leftJoystick")]
    pub left_joystick: JoystickAngleConfiguration,
}

impl Default for ServiceConfiguration {
    fn default() -> Self {
        ServiceConfiguration {
            left_joystick: JoystickAngleConfiguration {
                left_up_angle: 0.67,
                right_up_angle: 0.67,
            },
        }
    }
}
