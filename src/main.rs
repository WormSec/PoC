use std::{error::Error, sync::{Arc, Mutex}, thread::sleep, time::Duration};
use iptables::lock_ip;
use network::{broadcast, start_network_watcher, NetCallback};
use utils::read_ips_from_file;
use watcher::{start_watcher, Callback};
use local_ip_address::local_ip;

mod iptables;
mod network;
mod watcher;
mod utils;

fn main() -> Result<(), Box<dyn Error>>
{
    let my_ip = local_ip()?;
    let ips = read_ips_from_file("/app/ips.txt")?;

    println!("My IP: {my_ip}");

    let callback: Callback = Arc::new(Mutex::new(Box::new(move || {
        broadcast(&ips, &my_ip).ok();
    })));

    let net_callback: NetCallback = Arc::new(Mutex::new(Box::new(move |ip| {
        lock_ip(ip).ok();
    })));

    start_watcher(callback.clone());

    start_network_watcher(net_callback);

    loop {
        sleep(Duration::from_millis(100));
    }
}