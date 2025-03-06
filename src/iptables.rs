use std::{error::Error, io, net::IpAddr, process::Command};

// Kinda redundant, but I don't have enough Rust knowledge to do that otherwise

fn execute_iptables_command(is_v4: bool, args: &[&str]) -> Result<(), Box<dyn Error>> {
    let output = Command::new(if is_v4 { "iptables" } else { "ip6tables" })
        .args(args)
        .status();

    match output {
        Ok(status) => {
            if status.success() {
                Ok(())
            } else {
                Err(
                    Box::new(
                        io::Error::new(
                            io::ErrorKind::Other,
                            format!("Command exited with error code {}", status.code().unwrap_or(-1))
                        )
                    )
                )
            }
        },
        Err(e) => Err(Box::new(e))
    }
}

pub fn lock_ip(addr: IpAddr) -> Result<(), Box<dyn Error>>
{
    let ip = addr.to_string();

    let rules = [
        vec!["-A", "INPUT", "-s", &ip, "-j", "DROP"],
        vec!["-A", "OUTPUT", "-d", &ip, "-j", "DROP"],
    ];

    for rule in &rules {
        execute_iptables_command(match addr {
            IpAddr::V4(_) => true,
            IpAddr::V6(_) => false,
        }, rule)?;
    }

    Ok(())
}

pub fn unlock_ip(addr: IpAddr) -> Result<(), Box<dyn Error>>
{
    let ip = addr.to_string();
    let rules = [
        vec!["-D", "INPUT", "-s", &ip, "-j", "DROP"],
        vec!["-D", "OUTPUT", "-d", &ip, "-j", "DROP"],
    ];

    for rule in &rules {
        execute_iptables_command(match addr {
            IpAddr::V4(_) => true,
            IpAddr::V6(_) => false,
        }, rule)?;
    }

    Ok(())
}