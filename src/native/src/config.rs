#[cfg(windows)]
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
    pub up: Option<u8>,
    pub up_two: Option<u8>,
    pub left: Option<u8>,
    pub left_two: Option<u8>,
    pub down: Option<u8>,
    pub down_two: Option<u8>,
    pub right: Option<u8>,
    pub right_two: Option<u8>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct KeyMapping {
    #[serde(rename = "leftJoystick")]
    pub left_joystick: JoystickKeyMapping,
}

impl Default for KeyMapping {
    fn default() -> Self {
        KeyMapping {
            #[cfg(windows)]
            left_joystick: JoystickKeyMapping {
                up: KeyId::to_u8(&KeyId::W),
                up_two: None,
                down: KeyId::to_u8(&KeyId::S),
                down_two: None,
                left: KeyId::to_u8(&KeyId::A),
                left_two: None,
                right: KeyId::to_u8(&KeyId::D),
                right_two: None,
            },
            #[cfg(not(windows))]
            left_joystick: JoystickKeyMapping {
                up: Some(0),
                up_two: None,
                down: Some(0),
                down_two: None,
                left: Some(0),
                left_two: None,
                right: Some(0),
                right_two: None,
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
