use inotify::{Inotify, WatchMask};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

/// A type alias for a callback function that is executed when a file event is detected.
///
/// The callback is wrapped in an `Arc` for shared ownership and a `Mutex` for safe
/// concurrent access across threads. It is expected to be a function with no arguments
/// and no return value (`()`), which is triggered when a watched event occurs.
pub type Callback = Arc<Mutex<Box<dyn Fn() + Send + 'static>>>;

/// Starts a file watcher on the specified log file and invokes the callback function when an event is detected.
///
/// This function uses the `inotify` crate to monitor the `/var/log/auth.log` file for specific events such as:
/// `ACCESS`, `OPEN`, and `ATTRIB` (modification of file attributes). When such an event is detected,
/// the provided callback function is called.
///
/// The watcher runs in a separate thread to avoid blocking the main execution.
///
/// # Arguments
///
/// * `callback` - A callback function wrapped in an `Arc<Mutex<Box<dyn Fn() + Send + 'static>>>`. This function
///   will be executed when a file event is detected on the watched file.
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