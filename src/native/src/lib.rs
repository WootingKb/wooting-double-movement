#[macro_use]
extern crate lazy_static;

use env_logger::Env;
use log::*;
use neon::prelude::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::thread;

mod controller;
mod service;

lazy_static! {
    static ref MSG_THREAD_RUNNING: AtomicBool = AtomicBool::new(false);
    static ref MESSAGE_LOOP: Mutex<Option<thread::JoinHandle<()>>> = Mutex::new(None);
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

    Ok(())
}

fn start_service(mut cx: FunctionContext) -> JsResult<JsNull> {
    if MESSAGE_LOOP.lock().unwrap().is_some() {
        // This means the service has already been started
        warn!("start_service was called when the service was already running, ignoring...");
        return Ok(cx.null());
    }

    MSG_THREAD_RUNNING.store(true, Ordering::SeqCst);
    let callback = cx.argument::<JsFunction>(0)?.root(&mut cx);
    let queue = cx.queue();

    info!("Starting service");
    #[cfg(windows)]
    MESSAGE_LOOP.lock().unwrap().replace(thread::spawn(move || {
        if let Err(e) = service::start_service(&MSG_THREAD_RUNNING) {
            error!("Service died with error {:#?}", e);

            queue.send(move |mut cx| {
                let callback = callback.into_inner(&mut cx);
                let this = cx.undefined();
                let args = vec![cx.error(format!("{:#?}", e)).unwrap().upcast::<JsValue>()];
                callback.call(&mut cx, this, args)?;
                Ok(())
            });
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

    return Ok(cx.null());
}
