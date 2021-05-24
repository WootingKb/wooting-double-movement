use anyhow::{Context, Result};
use log::*;
#[cfg(windows)]
#[cfg(feature = "rawinput")]
use multiinput::*;
#[cfg(windows)]
use vigem::{
    *,
    notification::*,
    raw::{LPVOID, PVIGEM_CLIENT, PVIGEM_TARGET, UCHAR},
};

use crate::config::ServiceConfiguration;
use crate::controller::*;

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
        }
    }

    pub fn init(&mut self, config: ServiceConfiguration) -> Result<()> {
        if self.initd {
            return Ok(());
        }
        self.config = config;

        info!("Service init");

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

    fn update_controller(&mut self) -> Result<()> {
        if let Some(controller) = self.controller.as_mut() {
            #[cfg(feature = "ds4")]
            let report = self
                .controller_state
                .get_ds4_report(Some(&self.config.left_joystick_angles));

            #[cfg(not(feature = "ds4"))]
            let report = self
                .controller_state
                .get_xusb_report(Some(&self.config.left_joystick_angles));

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
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Up, self.key_bind_state.up || self.key_bind_state.up_two)
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.up_two => {
                        self.key_bind_state.up_two = state == State::Pressed;
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Up, self.key_bind_state.up || self.key_bind_state.up_two)
                    }
                    x if x == self.config.key_mapping.left_joystick.down => {
                        self.key_bind_state.down = state == State::Pressed;
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Down, self.key_bind_state.down || self.key_bind_state.down_two)
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.down_two => {
                        self.key_bind_state.down_two = state == State::Pressed;
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Down, self.key_bind_state.down || self.key_bind_state.down_two)
                    }
                    x if x == self.config.key_mapping.left_joystick.right => {
                        self.key_bind_state.right = state == State::Pressed;
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Right, self.key_bind_state.right || self.key_bind_state.right_two)
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.right_two => {
                        self.key_bind_state.right_two = state == State::Pressed;
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Right, self.key_bind_state.right || self.key_bind_state.right_two)
                    }
                    x if x == self.config.key_mapping.left_joystick.left => {
                        self.key_bind_state.left = state == State::Pressed;
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Left, self.key_bind_state.left || self.key_bind_state.left_two)
                    }
                    x if Some(x) == self.config.key_mapping.left_joystick.left_two => {
                        self.key_bind_state.left_two = state == State::Pressed;
                        self.controller_state.left_joystick.set_direction_state(JoystickDirection::Left, self.key_bind_state.left || self.key_bind_state.left_two)
                    }
                    _ => false,
                },
                _ => false,
            }
        } else {
            false
        }
    }

    pub fn poll(&mut self) -> Result<()> {
        if self.initd {
            #[cfg(feature = "rawinput")]
            if self.process_rawinput_event() {
                self.update_controller()?;
            }

            #[cfg(not(feature = "rawinput"))]
            if self
                .controller_state
                .left_joystick
                .update_key_states(&self.config.key_mapping.left_joystick)
            {
                self.update_controller()?;
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

    pub fn stop(&mut self) {
        info!("Service stop");
        if let Some(controller) = self.controller.take() {
            drop(controller);
        }

        self.vigem.disconnect();
        self.initd = false;
    }

    pub fn set_config(&mut self, config: ServiceConfiguration) -> Result<()> {
        self.config = config;
        self.update_controller()?;
        Ok(())
    }
}
