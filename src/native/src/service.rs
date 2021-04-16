use crate::controller::*;
#[cfg(windows)]
use multiinput::*;

use crate::config::ServiceConfiguration;
use anyhow::{Context, Result};
use log::*;
#[cfg(windows)]
use vigem::{
    notification::*,
    raw::{LPVOID, PVIGEM_CLIENT, PVIGEM_TARGET, UCHAR},
    *,
};

use winapi::um::winuser::GetAsyncKeyState;

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

pub struct Service {
    vigem: Vigem,
    controller: Option<Target>,
    // input_manager: RawInputManager,
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
            vigem: Vigem::new(),
            controller: None,
            controller_state: ControllerState::new(),
            // input_manager: RawInputManager::new().unwrap(),
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

        // self.input_manager.register_devices(DeviceType::Keyboards);

        // connect our client to a VigemBus
        self.vigem.connect().context(
            "Failed to connect to VigemBus. Please ensure you have ViGEmBus properly installed",
        )?;
        // Make a new target which represent XBOX360 controller
        let mut target = Target::new(TargetType::Xbox360);
        target.set_vid(0x31e3);
        target.set_pid(0xFFFF);

        // Get controller state - as target isnt connected state is "Initialized"
        dbg!(target.state());
        // Add target to VigemBUS
        self.vigem
            .target_add(&mut target)
            .context("Failed to add target to ViGEmBus")?;
        // Now it's connected!
        dbg!(target.state());

        info!(
            "Added Xbox360 Controller target to ViGEm with state {:?}",
            target.state()
        );

        let report = self.controller_state.get_xusb_report(None);
        target.update(&report)?;

        self.controller = Some(target);

        self.initd = true;

        Ok(())
    }

    pub fn poll(&mut self) -> Result<()> {
        if let Some(controller) = self.controller.as_mut() {
            unsafe {
                let state =
                    GetAsyncKeyState(self.config.key_mapping.left_joystick.up as i32) as u32;
                self.controller_state
                    .left_joystick
                    .set_direction_state(JoystickDirection::Up, state & 0x8000 != 0);

                let state =
                    GetAsyncKeyState(self.config.key_mapping.left_joystick.down as i32) as u32;

                self.controller_state
                    .left_joystick
                    .set_direction_state(JoystickDirection::Down, state & 0x8000 != 0);

                let state =
                    GetAsyncKeyState(self.config.key_mapping.left_joystick.left as i32) as u32;

                self.controller_state
                    .left_joystick
                    .set_direction_state(JoystickDirection::Left, state & 0x8000 != 0);

                let state =
                    GetAsyncKeyState(self.config.key_mapping.left_joystick.right as i32) as u32;

                self.controller_state
                    .left_joystick
                    .set_direction_state(JoystickDirection::Right, state & 0x8000 != 0);
            }

            let report = self
                .controller_state
                .get_xusb_report(Some(&self.config.left_joystick_angles));
            controller.update(&report)?;
        }

        Ok(())
    }

    pub fn get_xinput_slot(&mut self) -> Option<u32> {
        if let Some(controller) = self.controller.as_ref() {
            let slot = self.vigem.xbox_get_user_index(&controller);
            info!("We got slot {}", slot);
            Some(slot)
        } else {
            None
        }
    }

    pub fn stop(&mut self) {
        info!("Service stop");
        if let Some(controller) = self.controller.take() {
            drop(controller);
        }

        self.vigem.disconnect();
        self.initd = false;
    }

    pub fn set_config(&mut self, config: ServiceConfiguration) {
        self.config = config;
    }
}
