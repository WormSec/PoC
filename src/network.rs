use std::{io, net::{IpAddr, SocketAddr, UdpSocket}, str::FromStr, sync::{Arc, Mutex}, thread};

use crate::state;

/// A type alias for a callback function that accepts an IP address and performs an action.
///
/// The callback is wrapped in a `Mutex` to allow for safe concurrent access and 
/// in an `Arc` to allow sharing between threads. It is expected to take an `IpAddr`
/// and return nothing (i.e., it's a side-effecting function).
pub type NetCallback = Arc<Mutex<Box<dyn Fn(IpAddr) + Send + 'static>>>;

/// Starts a network watcher that listens for incoming UDP packets and invokes the callback when an IP address is received.
///
/// This function listens on a specific port (`21335`), expecting to receive UDP packets containing an
/// IP address. When a valid IP address is received, the provided callback function is called with
/// the IP address, allowing the application to act on the detected IP (e.g., locking it).
///
/// The function runs in a separate thread to handle incoming data asynchronously.
///
/// # Arguments
///
/// * `callback` - A callback function wrapped in an `Arc<Mutex<Box<dyn Fn(IpAddr) + Send + 'static>>>`.
///   This callback is triggered whenever a valid IP address is received.
pub fn start_network_watcher(callback: NetCallback)
{
    thread::spawn(move || {
        let socket = UdpSocket::bind("0.0.0.0:21335").unwrap(); // 21335 => b"WS"

        let mut buf = [0; 128];
        loop {
            let (amt, _src) = socket.recv_from(&mut buf).unwrap();
            let received_data = String::from_utf8_lossy(&buf[..amt]).trim().to_string();

            match IpAddr::from_str(&received_data) {
                Ok(ip) => {
                    println!("Received valid IP {received_data}. Locking IP...");
                    let cb = callback.lock().unwrap();
                    cb(ip);
                },
                Err(_) => {},
            }
        }
    });
}


/// Broadcasts the provided IP address to all other machines in the state.
///
/// This function sends the provided IP address to all other machines except the local machine.
/// It uses UDP to send the IP address to each machine in the list of machines stored in the state,
/// on port `21335`. The function is typically used when an unusual action is detected
/// and needs to be communicated to other machines.
///
/// # Arguments
///
/// * `text` - The IP address to broadcast to the other machines.
///
/// # Returns
///
/// This function returns a `io::Result<()>` indicating whether the broadcasting was successful.
/// 
/// * `Ok(())` if the broadcast was successfully sent.
/// * `Err(io::Error)` if there was an error while sending the UDP message.
pub fn broadcast(text: &IpAddr) -> io::Result<()>
{
    let socket = UdpSocket::bind("0.0.0.0:0")?;

    println!("Unusual action detected. Broadcasting info.");

    for machine in state::get_machines() {
        if IpAddr::from_str(&machine.ip).unwrap() != *text {
            let server = SocketAddr::new(IpAddr::from_str(&machine.ip).unwrap(), 21335);
            socket.send_to(text.to_string().as_bytes(), server)?;
        }
    }

    Ok(())
}