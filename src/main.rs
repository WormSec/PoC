use std::{error::Error, sync::{Arc, Mutex}, thread::sleep, time::Duration};
use iptables::lock_ip;
use network::{broadcast, start_network_watcher, NetCallback};
use state::change_machine_state;
use utils::read_ips_from_file;
use watcher::{start_watcher, Callback};
use local_ip_address::local_ip;
use tokio::task;
use web_server::run_web_server;

mod iptables;
mod network;
mod state;
mod utils;
mod watcher;
mod web_server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>>
{
    let my_ip = local_ip()?;
    let ips = read_ips_from_file("/app/ips.txt")?;

    state::from_list(ips).await;

    println!("My IP: {my_ip}");

    let callback: Callback = Arc::new(Mutex::new(Box::new(move || {
        task::spawn(async move {
            broadcast(&my_ip).await.ok();
        });
    })));

    let net_callback: NetCallback = Arc::new(Mutex::new(Box::new(move |ip| {
        task::spawn(async move {
            change_machine_state(&ip.to_string(), "isolated").await;
        });
        lock_ip(ip).ok();
    })));

    start_watcher(callback.clone());

    start_network_watcher(net_callback);

    let _web_server = task::spawn(run_web_server());

    loop {
        sleep(Duration::from_millis(100));
    }
}