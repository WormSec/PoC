use std::{error::Error, io, net::IpAddr, process::Command};

// Kinda redundant, but I don't have enough Rust knowledge to do that otherwise

/// Executes an iptables or ip6tables command with the given arguments.
///
/// This function runs the specified command (`iptables` for IPv4 or `ip6tables` for IPv6)
/// with the provided arguments. It checks the command's exit status and returns either
/// a success or an error with a message containing the error code if the command fails.
///
/// # Arguments
///
/// * `is_v4` - A boolean indicating whether the command should use `iptables` (true for IPv4)
///   or `ip6tables` (false for IPv6).
/// * `args` - A slice of string arguments to pass to the `iptables` or `ip6tables` command.
///
/// # Returns
///
/// * `Ok(())` if the command executed successfully.
/// * `Err(Box<dyn Error>)` if an error occurred while executing the command, containing
///   the error details.
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

/// Locks the specified IP address by adding rules to drop incoming and outgoing traffic.
///
/// This function creates and executes two iptables rules to lock the provided IP address.
/// It will drop both incoming (`INPUT`) and outgoing (`OUTPUT`) traffic for the specified
/// IP address, preventing any network communication to or from it.
///
/// # Arguments
///
/// * `addr` - The IP address to lock. Can be either IPv4 or IPv6.
///
/// # Returns
///
/// * `Ok(())` if the IP was successfully locked.
/// * `Err(Box<dyn Error>)` if there was an error while applying the iptables rules.
///
/// # Example
///
/// ```rust
/// use std::net::IpAddr;
/// let ip: IpAddr = "192.168.1.100".parse().unwrap();  // Replace with your IP address
/// lock_ip(ip).unwrap();
/// ```
pub fn lock_ip(addr: IpAddr) -> Result<(), Box<dyn Error>>
{
    let ip = addr.to_string();

    println!("Locking IP {ip}");

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

/// Unlocks the specified IP address by removing iptables rules to allow incoming and outgoing traffic.
///
/// This function reverses the action of `lock_ip`. It removes two iptables rules to allow both
/// incoming (`INPUT`) and outgoing (`OUTPUT`) traffic for the specified IP address.
///
/// # Arguments
///
/// * `addr` - The IP address to unlock. Can be either IPv4 or IPv6.
///
/// # Returns
///
/// * `Ok(())` if the IP was successfully unlocked (rules were removed).
/// * `Err(Box<dyn Error>)` if there was an error while executing the iptables commands.
///
/// # Example
///
/// ```rust
/// use std::net::IpAddr;
/// let ip: IpAddr = "192.168.1.100".parse().unwrap();  // Replace with your IP address
/// unlock_ip(ip).unwrap();
/// ```
#[allow(dead_code)]
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