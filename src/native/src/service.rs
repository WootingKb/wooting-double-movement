use std::collections::HashMap;

use anyhow::{Context, Result};
use log::*;
#[cfg(windows)]
#[cfg(feature = "rawinput")]
use multiinput::*;
use sdk::{DeviceInfo, WootingAnalogResult};
use serde::{Deserialize, Serialize};
#[cfg(windows)]
use vigem::{
    notification::*,
    raw::{LPVOID, PVIGEM_CLIENT, PVIGEM_TARGET, UCHAR},
    *,
};
use wooting_analog_wrapper as sdk;

use crate::config::ServiceConfiguration;
use crate::controller::*;

#[derive(Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", content = "value")]
pub enum AnalogSDKState {
    Uninitialized,
    Error(sdk::WootingAnalogResult),
    DevicesConnected(Vec<String>),
    NoDevices,
}

#[cfg(windows)]
unsafe extern "C" fn _handle(
    client: PVIGEM_CLIENT,
    target: PVIGEM_TARGET,
    large_motor: UCHAR,
    small_motor: UCHAR,
    led_number: UCHAR,
    user_data: LPVOID,
) {
    // make a safe absraction over all arguments
    let notification: X360Notification<i32> = X360Notification::new(
        client,
        target,
        large_motor,
        small_motor,
        led_number,
        user_data,
    );

    // get target and client which we got in our callback
    let target = notification.get_target();

    println!(
        "Large motor is: {}, small is : {}",
        notification.large_motor, notification.small_motor
    );
    println!("Led number: {}", notification.led_number);
    dbg!(target.state());

    // Get userdata(I dont know what it is)
    dbg!(notification.userdata());
}

#[cfg(feature = "rawinput")]
pub struct KeyBindState {
    up: bool,
    up_two: bool,
    down: bool,
    down_two: bool,
    left: bool,
    left_two: bool,
    right: bool,
    right_two: bool,
}

#[cfg(feature = "rawinput")]
impl KeyBindState {
    pub fn new() -> Self {
        KeyBindState {
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
}

pub struct Service {
    #[cfg(feature = "rawinput")]
    key_bind_state: KeyBindState,
    vigem: Vigem,
    controller: Option<Target>,
    #[cfg(feature = "rawinput")]
    input_manager: RawInputManager,
    controller_state: ControllerState,
    initd: bool,
    config: ServiceConfiguration,
    analog_initialised: bool,
    sdk_state: AnalogSDKState,
    is_detecting: bool,
}

// Service should be wrapped in Mutex if used across threads so minimise unsafety
unsafe impl Send for Service {}

unsafe impl Sync for Service {}

impl Service {
    pub fn new() -> Self {
        Service {
            #[cfg(feature = "rawinput")]
            key_bind_state: KeyBindState::new(),
            vigem: Vigem::new(),
            controller: None,
            controller_state: ControllerState::new(),
            #[cfg(feature = "rawinput")]
            input_manager: RawInputManager::new().unwrap(),
            initd: false,
            config: ServiceConfiguration::default(),
            analog_initialised: false,
            sdk_state: AnalogSDKState::Uninitialized,
            is_detecting: false,
        }
    }

    pub fn init(&mut self, config: ServiceConfiguration) -> Result<()> {
        if self.initd {
            return Ok(());
        }
        self.config = config;

        info!("Service init");

        if self.config.use_analog_input {
            self.init_analog()?;
        }

        #[cfg(feature = "rawinput")]
        self.input_manager.register_devices(DeviceType::Keyboards);

        // connect our client to a VigemBus
        self.vigem.connect().context(
            "Failed to connect to VigemBus. Please ensure you have ViGEmBus properly installed",
        )?;

        #[cfg(feature = "ds4")]
        let mut target = {
            // Make a new target which represent DualShock4 controller
            let t = Target::new(TargetType::DualShock4);
            // DS4 vid/pid
            t.set_vid(0x054C);
            t.set_pid(0x05C4);
            t
        };

        #[cfg(not(feature = "ds4"))]
        let mut target = {
            // Make a new target which represent XBOX360 controller
            let t = Target::new(TargetType::Xbox360);
            t.set_vid(0x31e3);
            t.set_pid(0xFFFF);
            t
        };

        // Get controller state - as target isnt connected state is "Initialized"
        debug!("Controller state {:?}", target.state());

        // Add target to VigemBUS
        self.vigem
            .target_add(&mut target)
            .context("Failed to add target to ViGEmBus")?;

        // Now it's connected!
        debug!("Controller state {:?}", target.state());

        info!(
            "Added Controller target to ViGEm with state {:?}",
            target.state()
        );

        self.controller = Some(target);

        self.update_controller()?;

        self.initd = true;

        Ok(())
    }

    fn init_analog(&mut self) -> Result<()> {
        if self.analog_initialised {
            return Ok(());
        }

        // TODO: Remove this, is only for testing without uninit
        // if sdk::is_initialised() {
        //     return Ok(());
        // }

        let init_result = sdk::initialise();

        match init_result.0 {
            Ok(device_num) => {
                info!(
                    "Analog SDK Successfully initialised with {} devices",
                    device_num
                );

                let devices: Vec<DeviceInfo> = sdk::get_connected_devices_info(10).0.unwrap();
                assert_eq!(device_num, devices.len() as u32);
                for (i, device) in devices.iter().enumerate() {
                    println!("Device {} is {:?}", i, device);
                }
                if device_num > 0 {
                    self.sdk_state = AnalogSDKState::DevicesConnected(
                        devices
                            .iter()
                            .map(|device| device.device_name.clone())
                            .collect(),
                    );
                } else {
                    self.sdk_state = AnalogSDKState::NoDevices;
                }

                sdk::set_keycode_mode(sdk::KeycodeType::VirtualKeyTranslate)
                    .0
                    .context("Failed to set keyboard mode")?;

                self.analog_initialised = true;
            }
            Err(e) => {
                error!("Wooting Analog SDK Failed to initialise: {}", e);

                self.sdk_state = AnalogSDKState::Error(e)
            }
        };

        Ok(())
    }

    fn uninit_analog(&mut self) -> Result<()> {
        if !self.analog_initialised {
            return Ok(());
        }

        self.sdk_state = AnalogSDKState::Uninitialized;
        sdk::uninitialise()
            .0
            .context("Failed to uninitialise analog sdk")?;
        self.analog_initialised = false;
        Ok(())
    }

    fn output_controller_detection(&mut self) -> Result<()> {
        if let Some(controller) = self.controller.as_mut() {
            let tiny_axis_y: f32 = 0.6;

            let _ = self
                .controller_state
                .left_joystick
                .set_direction_state_analog(JoystickDirection::Left, 0.0)
                | self
                    .controller_state
                    .left_joystick
                    .set_direction_state_analog(JoystickDirection::Right, 0.0)
                | self
                    .controller_state
                    .left_joystick
                    .set_direction_state_analog(JoystickDirection::Up, tiny_axis_y)
                | self
                    .controller_state
                    .left_joystick
                    .set_direction_state_analog(JoystickDirection::Down, 0.0);

            #[cfg(feature = "ds4")]
            let report = self
                .controller_state
                .get_ds4_report_from_axis(0.0, tiny_axis_y);

            #[cfg(not(feature = "ds4"))]
            let report = self
                .controller_state
                .get_xusb_report_from_axis(0.0, tiny_axis_y);

            controller.update(&report)?;
        }
        Ok(())
    }

    fn update_controller(&mut self) -> Result<()> {
        if let Some(controller) = self.controller.as_mut() {
            #[cfg(feature = "ds4")]
            let report = self
                .controller_state
                .get_ds4_report(Some(&self.config.left_joystick_strafing_angles));

            #[cfg(not(feature = "ds4"))]
            let report = self
                .controller_state
                .get_xusb_report(Some(&self.config.left_joystick_strafing_angles));

            controller.update(&report)?;
        }
        Ok(())
    }

    #[cfg(feature = "rawinput")]
    fn process_rawinput_event(&mut self) -> bool {
        if let Some(event) = self.input_manager.get_event() {
            // debug!("{:?}", event);
            match event {
                RawEvent::KeyboardEvent(_, key, state) => match KeyId::to_u8(&key).unwrap() {
                    x if x == self.config.key_mapping.left_joystick.up => {
                        self.key_bind_state.up = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Up,
                                self.key_bind_state.up || self.key_bind_state.up_two,
                            )
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.up_two => {
                        self.key_bind_state.up_two = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Up,
                                self.key_bind_state.up || self.key_bind_state.up_two,
                            )
                    }
                    x if x == self.config.key_mapping.left_joystick.down => {
                        self.key_bind_state.down = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Down,
                                self.key_bind_state.down || self.key_bind_state.down_two,
                            )
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.down_two => {
                        self.key_bind_state.down_two = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Down,
                                self.key_bind_state.down || self.key_bind_state.down_two,
                            )
                    }
                    x if x == self.config.key_mapping.left_joystick.right => {
                        self.key_bind_state.right = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Right,
                                self.key_bind_state.right || self.key_bind_state.right_two,
                            )
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.right_two => {
                        self.key_bind_state.right_two = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Right,
                                self.key_bind_state.right || self.key_bind_state.right_two,
                            )
                    }
                    x if x == self.config.key_mapping.left_joystick.left => {
                        self.key_bind_state.left = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Left,
                                self.key_bind_state.left || self.key_bind_state.left_two,
                            )
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.left_two => {
                        self.key_bind_state.left_two = state == State::Pressed;
                        self.controller_state
                            .left_joystick
                            .set_direction_state_digital(
                                JoystickDirection::Left,
                                self.key_bind_state.left || self.key_bind_state.left_two,
                            )
                    }
                    _ => false,
                },
                _ => false,
            }
        } else {
            false
        }
    }

    fn get_bind_analog(
        &self,
        analog_data: &HashMap<u16, f32>,
        bind_one: Option<u8>,
        bind_two: Option<u8>,
    ) -> f32 {
        let analog_one = {
            if let Some(bind) = bind_one {
                *analog_data.get(&(bind as u16)).unwrap_or(&0.0)
            } else {
                0.0
            }
        };

        let analog_two = {
            if let Some(bind) = bind_two {
                *analog_data.get(&(bind as u16)).unwrap_or(&0.0)
            } else {
                0.0
            }
        };

        f32::max(analog_one, analog_two)
    }

    fn update_direction_analog_empty(&mut self) -> bool {
        self.controller_state
            .left_joystick
            .set_direction_state_analog(JoystickDirection::Left, 0.0)
            | self
                .controller_state
                .left_joystick
                .set_direction_state_analog(JoystickDirection::Right, 0.0)
            | self
                .controller_state
                .left_joystick
                .set_direction_state_analog(JoystickDirection::Up, 0.0)
            | self
                .controller_state
                .left_joystick
                .set_direction_state_analog(JoystickDirection::Down, 0.0)
    }

    fn update_direction_analog(
        &mut self,
        direction: JoystickDirection,
        analog_data: &HashMap<u16, f32>,
        bind_one: Option<u8>,
        bind_two: Option<u8>,
    ) -> bool {
        let analog = self.get_bind_analog(analog_data, bind_one, bind_two);
        self.controller_state
            .left_joystick
            .set_direction_state_analog(direction, analog)
    }

    fn update_analog_inputs(&mut self) -> bool {
        // TODO: Handle case where there are no devices connected
        // TODO: Potentially update connected devices state in here
        match sdk::read_full_buffer(20).0 {
            Ok(analog) => {
                if self.sdk_state == AnalogSDKState::NoDevices {
                    let devices: Vec<DeviceInfo> = sdk::get_connected_devices_info(10).0.unwrap();

                    if devices.len() > 0 {
                        self.sdk_state = AnalogSDKState::DevicesConnected(
                            devices
                                .iter()
                                .map(|device| device.device_name.clone())
                                .collect(),
                        );
                    }
                }

                self.update_direction_analog(
                    JoystickDirection::Left,
                    &analog,
                    self.config.key_mapping.left_joystick.left,
                    self.config.key_mapping.left_joystick.left_two,
                ) | self.update_direction_analog(
                    JoystickDirection::Up,
                    &analog,
                    self.config.key_mapping.left_joystick.up,
                    self.config.key_mapping.left_joystick.up_two,
                ) | self.update_direction_analog(
                    JoystickDirection::Down,
                    &analog,
                    self.config.key_mapping.left_joystick.down,
                    self.config.key_mapping.left_joystick.down_two,
                ) | self.update_direction_analog(
                    JoystickDirection::Right,
                    &analog,
                    self.config.key_mapping.left_joystick.right,
                    self.config.key_mapping.left_joystick.right_two,
                )
            }
            Err(e) => {
                if e == WootingAnalogResult::NoDevices {
                    self.sdk_state = AnalogSDKState::NoDevices;
                }

                self.update_direction_analog_empty()
            }
        }
    }

    pub fn poll(&mut self) -> Result<()> {
        if self.initd {
            if self.is_detecting {
                self.output_controller_detection()?;
            } else {
                let should_update = {
                    // Analog being initialised implies that the setting for using analog is on
                    if self.analog_initialised {
                        self.update_analog_inputs()
                    } else {
                        #[cfg(feature = "rawinput")]
                        {
                            self.process_rawinput_event()
                        }

                        #[cfg(not(feature = "rawinput"))]
                        {
                            self.controller_state
                                .left_joystick
                                .update_key_states(&self.config.key_mapping.left_joystick)
                        }
                    }
                };

                if should_update {
                    self.update_controller()?;
                }
            }
        }

        Ok(())
    }

    pub fn get_xinput_slot(&mut self) -> Option<u32> {
        #[cfg(not(feature = "ds4"))]
        if let Some(controller) = self.controller.as_ref() {
            let slot = self.vigem.xbox_get_user_index(&controller);
            info!("We got slot {}", slot);
            return Some(slot);
        }
        None
    }

    pub fn get_sdk_state(&self) -> AnalogSDKState {
        self.sdk_state.clone()
    }

    pub fn stop(&mut self) {
        info!("Service stop");

        if let Some(controller) = self.controller.take() {
            drop(controller);
        }

        self.vigem.disconnect();

        if let Err(e) = self.uninit_analog() {
            error!("Error uninitialising analog {}", e)
        }
        self.initd = false;
    }

    pub fn set_config(&mut self, config: ServiceConfiguration) -> Result<()> {
        self.config = config;
        if self.config.use_analog_input {
            self.init_analog()?;
        } else {
            self.uninit_analog()?;
        }

        self.update_controller()?;
        Ok(())
    }

    pub fn set_gamepad_detection_state(&mut self, enabled: bool) {
        self.is_detecting = enabled;
    }
}
