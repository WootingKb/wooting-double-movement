use multiinput::{KeyId, ToPrimitive};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct JoystickAngleConfiguration {
    #[serde(rename = "leftUpAngle")]
    pub left_up_angle: f32,
    #[serde(rename = "rightUpAngle")]
    pub right_up_angle: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct JoystickKeyMapping {
    pub up: u8,
    pub left: u8,
    pub down: u8,
    pub right: u8,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct KeyMapping {
    #[serde(rename = "leftJoystick")]
    pub left_joystick: JoystickKeyMapping,
}

impl Default for KeyMapping {
    fn default() -> Self {
        KeyMapping {
            left_joystick: JoystickKeyMapping {
                up: KeyId::to_u8(&KeyId::W).unwrap(),
                down: KeyId::to_u8(&KeyId::S).unwrap(),
                left: KeyId::to_u8(&KeyId::A).unwrap(),
                right: KeyId::to_u8(&KeyId::D).unwrap(),
            },
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceConfiguration {
    #[serde(rename = "leftJoystickAngles")]
    pub left_joystick_angles: JoystickAngleConfiguration,
    #[serde(rename = "keyMapping")]
    pub key_mapping: KeyMapping,
}

impl Default for ServiceConfiguration {
    fn default() -> Self {
        ServiceConfiguration {
            left_joystick_angles: JoystickAngleConfiguration {
                left_up_angle: 0.67,
                right_up_angle: 0.67,
            },
            key_mapping: KeyMapping::default(),
        }
    }
}
