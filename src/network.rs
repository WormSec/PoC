use std::{io, net::{IpAddr, SocketAddr, UdpSocket}, str::FromStr, sync::{Arc, Mutex}, thread};

pub type NetCallback = Arc<Mutex<Box<dyn Fn(IpAddr) + Send + 'static>>>;

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

pub fn broadcast(ips: &Vec<IpAddr>, text: &IpAddr) -> io::Result<()>
{
    let socket = UdpSocket::bind("0.0.0.0:0")?;

    println!("Unusual action detected. Broadcasting info.");

    for ip in ips {
        let server = SocketAddr::new(*ip, 21335);
        socket.send_to(text.to_string().as_bytes(), server)?;
    }

    Ok(())
}