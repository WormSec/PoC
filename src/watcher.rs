use inotify::{Inotify, WatchMask};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub type Callback = Arc<Mutex<Box<dyn Fn() + Send + 'static>>>;

pub fn start_watcher(callback: Callback)
{
    thread::spawn(move || {
        let mut inotify = Inotify::init().expect("Failed to initialize inotify");
        inotify
            .watches()
            .add("/var/log/auth.log", WatchMask::ACCESS | WatchMask::OPEN | WatchMask::ATTRIB)
            .expect("Failed to watch /var/log/auth.log");

        let mut buffer = [0; 1024];

        loop {
            match inotify.read_events(&mut buffer) {
                Ok(_) => {
                    let cb = callback.lock().unwrap();
                    cb();
                },
                Err(_) => {}
            }
            thread::sleep(Duration::from_millis(100));
        }
    });
}