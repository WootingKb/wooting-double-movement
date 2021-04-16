#[macro_use]
extern crate lazy_static;

use dirs::config_dir;
use log::*;
use neon::prelude::*;
use simplelog::*;
use std::fs::{File, OpenOptions};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

mod config;
mod controller;
#[cfg(windows)]
mod service;

use config::ServiceConfiguration;
#[cfg(windows)]
use service::Service;

lazy_static! {
    static ref MSG_THREAD_RUNNING: AtomicBool = AtomicBool::new(false);
    static ref MESSAGE_LOOP: Mutex<Option<thread::JoinHandle<()>>> = Mutex::new(None);
}

#[cfg(windows)]
lazy_static! {
    static ref SERVICE: Arc<Mutex<Service>> = Arc::new(Mutex::new(Service::new()));
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    let log_path = config_dir()
        .unwrap()
        .join("wooting-double-movement/logs/service.log");
    CombinedLogger::init(vec![
        TermLogger::new(
            LevelFilter::Debug,
            Config::default(),
            TerminalMode::Mixed,
            ColorChoice::Always,
        ),
        WriteLogger::new(
            LevelFilter::Debug,
            Config::default(),
            OpenOptions::new()
                .write(true)
                .append(true)
                .open(log_path)
                .unwrap(),
        ),
    ])
    .unwrap();

    info!("Service module initialized");

    cx.export_function("start_service", start_service)?;
    cx.export_function("stop_service", stop_service)?;
    cx.export_function("get_xinput_slot", get_xinput_slot)?;
    cx.export_function("set_config", set_config)?;

    Ok(())
}

fn start_service(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    if MESSAGE_LOOP.lock().unwrap().is_some() {
        // This means the service has already been started
        warn!("start_service was called when the service was already running, ignoring...");
        return Ok(cx.boolean(true));
    }

    MSG_THREAD_RUNNING.store(true, Ordering::SeqCst);
    let config_arg = cx.argument::<JsString>(0)?.value(&mut cx);
    info!("Received config {}", config_arg);
    let config: ServiceConfiguration = serde_json::from_str(&config_arg[..]).unwrap();

    // We can unwrap this because panics get given up to javascript as regular errors
    #[cfg(windows)]
    match std::panic::catch_unwind(|| SERVICE.lock().unwrap().init(config)) {
        Ok(res) => res.unwrap(),
        Err(e) => {
            error!("The service init panicked {:#?}", e);
            return Ok(cx.boolean(false));
        }
    }

    // let callback = cx.argument::<JsFunction>(0)?.root(&mut cx);
    // let queue = cx.queue();
    info!("Starting service");
    #[cfg(windows)]
    MESSAGE_LOOP.lock().unwrap().replace(thread::spawn(move || {
        while MSG_THREAD_RUNNING.load(Ordering::SeqCst) {
            if let Err(e) = SERVICE.lock().unwrap().poll() {
                error!("Error occurred during polling {:#?}", e);

                // queue.send(move |mut cx| {
                //     let callback = callback.into_inner(&mut cx);
                //     let this = cx.undefined();
                //     let args = vec![cx.error(format!("{:#?}", e)).unwrap().upcast::<JsValue>()];
                //     callback.call(&mut cx, this, args)?;
                //     Ok(())
                // });
            }
            thread::sleep(Duration::from_millis(1));
        }
    }));

    return Ok(cx.boolean(true));
}

fn stop_service(mut cx: FunctionContext) -> JsResult<JsNull> {
    MSG_THREAD_RUNNING.store(false, Ordering::SeqCst);
    info!("Stopping service");
    #[cfg(windows)]
    {
        if let Some(thread) = MESSAGE_LOOP.lock().unwrap().take() {
            thread.join().expect("Thread failed to join");
        }
    }
    #[cfg(windows)]
    SERVICE.lock().unwrap().stop();
    return Ok(cx.null());
}

fn get_xinput_slot(mut cx: FunctionContext) -> JsResult<JsValue> {
    #[cfg(windows)]
    let slot = SERVICE.lock().unwrap().get_xinput_slot();

    #[cfg(windows)]
    if let Some(slot) = slot {
        return Ok(cx.number(slot).upcast());
    }

    return Ok(cx.null().upcast());
}

fn set_config(mut cx: FunctionContext) -> JsResult<JsNull> {
    let config_arg = cx.argument::<JsString>(0)?.value(&mut cx);
    let config: ServiceConfiguration = serde_json::from_str(&config_arg[..]).unwrap();
    info!("Received config {:?}", config);
    #[cfg(windows)]
    SERVICE.lock().unwrap().set_config(config).unwrap();
    return Ok(cx.null());
}
