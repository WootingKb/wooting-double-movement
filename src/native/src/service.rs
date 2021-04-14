use crate::controller::*;
#[cfg(windows)]
use multiinput::*;
use std::sync::atomic::{AtomicBool, Ordering};

use anyhow::{bail, Context, Result};
use log::*;
use std::time::Duration;
#[cfg(windows)]
use vigem::{
    notification::*,
    raw::{LPVOID, PVIGEM_CLIENT, PVIGEM_TARGET, UCHAR},
    *,
};

#[cfg(windows)]
unsafe extern "C" fn handle(
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

pub fn start_service(should_run: &AtomicBool) -> Result<()> {
    #[cfg(windows)]
    {
        let mut manager = RawInputManager::new().unwrap();
        manager.register_devices(DeviceType::Keyboards);

        let mut vigem = Vigem::new();
        // connect our client to a VigemBus
        vigem.connect().context(
            "Failed to connect to VigemBus. Please ensure you have ViGEmBus properly installed",
        )?;
        // Make a new target which represent XBOX360 controller
        let mut target = Target::new(TargetType::Xbox360);
        target.set_vid(0x31e3);
        target.set_pid(0xFFFF);

        // Get controller state - as target isnt connected state is "Initialized"
        dbg!(target.state());
        // Add target to VigemBUS
        vigem
            .target_add(&mut target)
            .context("Failed to add target to ViGEmBus")?;
        // Now it's connected!
        dbg!(target.state());

        info!(
            "Added Xbox360 Controller target to ViGEm with state {:?}",
            target.state()
        );

        // It's a bit harder. We register notification. Handle will be called every time controller get forcefeedbacked
        // vigem
        //     .x360_register_notification::<i32>(&target, Some(handle), 123123123)
        //     .unwrap();

        let mut controller_state = ControllerState::new();
        let report = controller_state.get_xusb_report();
        target.update(&report)?;

        let mut update_error_count = 0;
        while should_run.load(Ordering::SeqCst) {
            if let Some(event) = manager.get_event() {
                // debug!("{:?}", event);
                match event {
                    RawEvent::KeyboardEvent(_, key, state) => {
                        match key {
                            KeyId::W => {
                                controller_state.left_joystick.set_direction_state(
                                    JoystickDirection::Up,
                                    state == State::Pressed,
                                );
                            }
                            KeyId::S => {
                                controller_state.left_joystick.set_direction_state(
                                    JoystickDirection::Down,
                                    state == State::Pressed,
                                );
                            }
                            KeyId::A => {
                                controller_state.left_joystick.set_direction_state(
                                    JoystickDirection::Left,
                                    state == State::Pressed,
                                );
                            }
                            KeyId::D => {
                                controller_state.left_joystick.set_direction_state(
                                    JoystickDirection::Right,
                                    state == State::Pressed,
                                );
                            }
                            _ => {}
                        }
                        let report = controller_state.get_xusb_report();
                        if let Err(e) = target.update(&report) {
                            error!("Error occured while updating target: {}", e);
                            if update_error_count > 5 {
                                // In this case something is probably seriously wrong, let's throw the error up
                                Err(e)?;
                            }
                            update_error_count += 1;
                        }
                    }
                    _ => (),
                }
            }
            // TODO: Improve this to take into account that the loop takes time. Potentially make it configurable
            std::thread::sleep(Duration::from_millis(1));
        }
        debug!("Wrapping up service");
    }
    Ok(())
}
