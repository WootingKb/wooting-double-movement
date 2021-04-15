#[macro_use]
extern crate lazy_static;

use env_logger::Env;
use log::*;
use neon::prelude::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

mod config;
mod controller;
mod service;
use config::ServiceConfiguration;
use service::Service;

lazy_static! {
    static ref MSG_THREAD_RUNNING: AtomicBool = AtomicBool::new(false);
    static ref MESSAGE_LOOP: Mutex<Option<thread::JoinHandle<()>>> = Mutex::new(None);
    static ref SERVICE: Arc<Mutex<Service>> = Arc::new(Mutex::new(Service::new()));
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    if let Err(e) = env_logger::try_init_from_env(Env::new().default_filter_or("info")) {
        println!("Failed to init env logger {}", e);
    } else {
        info!("Logger initialised");
    }

    cx.export_function("start_service", start_service)?;
    cx.export_function("stop_service", stop_service)?;
    cx.export_function("get_xinput_slot", get_xinput_slot)?;
    cx.export_function("set_config", set_config)?;

    Ok(())
}

fn start_service(mut cx: FunctionContext) -> JsResult<JsNull> {
    if MESSAGE_LOOP.lock().unwrap().is_some() {
        // This means the service has already been started
        warn!("start_service was called when the service was already running, ignoring...");
        return Ok(cx.null());
    }

    MSG_THREAD_RUNNING.store(true, Ordering::SeqCst);
    let config_arg = cx.argument::<JsString>(0)?.value(&mut cx);
    info!("Received config {}", config_arg);
    let config: ServiceConfiguration = serde_json::from_str(&config_arg[..]).unwrap();

    // We can unwrap this because panics get given up to javascript as regular errors
    SERVICE.lock().unwrap().init(config).unwrap();

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

    return Ok(cx.null());
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
    SERVICE.lock().unwrap().stop();
    return Ok(cx.null());
}

fn get_xinput_slot(mut cx: FunctionContext) -> JsResult<JsValue> {
    let slot = SERVICE.lock().unwrap().get_xinput_slot();
    if let Some(slot) = slot {
        return Ok(cx.number(slot).upcast());
    } else {
        return Ok(cx.null().upcast());
    }
}

fn set_config(mut cx: FunctionContext) -> JsResult<JsNull> {
    let config_arg = cx.argument::<JsString>(0)?.value(&mut cx);
    let config: ServiceConfiguration = serde_json::from_str(&config_arg[..]).unwrap();
    info!("Received config {:?}", config);
    SERVICE.lock().unwrap().set_config(config);
    return Ok(cx.null());
}
