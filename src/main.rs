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

/// The main entry point for the application.
///
/// This is an asynchronous function that performs the following:
/// 1. Retrieves the local IP address of the machine.
/// 2. Loads a list of IP addresses from a file (`ips.txt`).
/// 3. Initializes the application state based on the loaded IP addresses.
///
/// It sets up a watcher that monitors network activity and performs actions when a specific IP
/// is encountered. It also starts a web server asynchronously and runs in a loop waiting for events.
///
/// # Workflow:
///
/// 1. The function starts by loading the local IP of the current machine (`my_ip`).
/// 2. The list of IP addresses is read from a file (`ips.txt`), and the state is initialized using these IPs.
/// 3. It sets up two types of callbacks:
///    - **General callback** (`callback`) for handling machine state transitions when specific IPs are detected.
///    - **Network callback** (`net_callback`) to trigger actions when network activity with certain IPs is observed.
/// 4. A **network watcher** and a **local callback handler** are set up to monitor the system and change the machine state and lock IPs if necessary.
/// 5. The web server (`run_web_server`) is spawned asynchronously to handle web requests or status updates.
/// 6. The function enters an infinite loop (`loop { sleep(Duration::from_millis(1000)); }`) to keep the program running.
///
/// # Returns
///
/// This function returns a `Result<(), Box<dyn Error>>`:
/// * `Ok(())` on successful execution.
/// * `Err(Box<dyn Error>)` if any error occurs during execution (e.g., reading the IPs, initializing state, etc.).
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>>
{
    let my_ip = local_ip()?;
    let ips = read_ips_from_file("./ips.txt")?;

    println!("Loaded {} IPS: {:?}", ips.len(), ips);

    state::from_list(ips);

    println!("My IP: {my_ip}");

    let callback: Callback = Arc::new(Mutex::new(Box::new(move || {
        change_machine_state(&my_ip.to_string(), "isolated");
        broadcast(&my_ip).ok();
    })));

    let net_callback: NetCallback = Arc::new(Mutex::new(Box::new(move |ip| {
        change_machine_state(&ip.to_string(), "isolated");
        lock_ip(ip).ok();
    })));

    start_watcher(callback.clone());

    start_network_watcher(net_callback);

    let _web_server = task::spawn(run_web_server());

    loop {
        sleep(Duration::from_millis(1000));
    }
}