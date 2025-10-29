use serde::{Serialize, Deserialize};
use std::{net::IpAddr, sync::{Arc, Mutex}};
use once_cell::sync::Lazy;

/// Represents a machine in the network.
///
/// This struct contains the details of a machine, including its ID, name, IP address,
/// MAC address, last update time, and current status. It is used to track the machines
/// within the network and manage their states.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Machine {
    /// The unique identifier for the machine.
    pub id: String,
    /// The name of the machine.
    pub name: String,
    /// The IP address of the machine.
    pub ip: String,
    /// The MAC address of the machine.
    pub mac: String,
    /// The last time the machine was updated.
    pub last_update: String,
    /// The current status of the machine (e.g., "connected", "isolated").
    pub status: String,
}

/// A globally accessible, thread-safe vector holding machines in the system.
///
/// The `MACHINES` static variable stores a list of all the machines in the network. It is
/// wrapped in an `Arc<Mutex<T>>` to allow shared, concurrent access from multiple threads.
///
/// The `Lazy` initialization ensures that the `MACHINES` variable is only created when it's accessed for the first time.
pub static MACHINES: Lazy<Arc<Mutex<Vec<Machine>>>> = Lazy::new(|| {Arc::new(Mutex::new(Vec::new()))});

/// Retrieves the current list of machines.
///
/// This function locks the `MACHINES` mutex and returns a clone of the vector of machines.
///
/// # Returns
///
/// * `Vec<Machine>` - A vector containing all the machines in the system.
pub fn get_machines() -> Vec<Machine>
{
    let machines = MACHINES.lock().unwrap();
    machines.clone()
}

/// Changes the state of a machine identified by its IP address.
///
/// This function locates the machine with the given IP address and updates its `status`
/// field to the new status provided.
///
/// # Arguments
///
/// * `ip` - The IP address of the machine whose status needs to be changed.
/// * `new_status` - The new status to assign to the machine (e.g., "isolated").
pub fn change_machine_state(ip: &str, new_status: &str)
{
    let mut machines = MACHINES.lock().unwrap();
    if let Some(machine) = machines.iter_mut().find(|m| m.ip == ip) {
        machine.status = new_status.to_string();
    }
}

/// Initializes the `MACHINES` list from a given list of IP addresses.
///
/// This function populates the `MACHINES` vector with a machine entry for each IP address
/// provided in `ip_list`. The machines are initialized with default values for `name`, `mac`,
/// `last_update`, and `status`. The machine `id` is generated based on the index in the list.
///
/// # Arguments
///
/// * `ip_list` - A list of `IpAddr` values representing the IP addresses of the machines.
pub fn from_list(ip_list: Vec<IpAddr>)
{
    let mut machines = MACHINES.lock().unwrap();
    *machines = ip_list
        .into_iter()
        .enumerate()
        .map(|(index, ip)| Machine {
            id: (index + 1).to_string(),
            name: (index + 1).to_string(),
            ip: ip.to_string(),
            mac: "AA:BB:CC:DD:EE:FF".to_string(),
            last_update: "N/A".to_string(),
            status: "connected".to_string(),
        })
        .collect();
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::{Ipv4Addr, IpAddr};

    fn reset_machines() {
        let mut machines = MACHINES.lock().unwrap();
        machines.clear();
    }

    #[test]
    fn test_get_machines_empty() {
        reset_machines();

        let machines = get_machines();
        assert!(machines.is_empty());
    }

    #[test]
    fn test_get_machines_non_empty() {
        reset_machines();

        let ip_list = vec![
            Ipv4Addr::new(192, 168, 1, 1).into(),
            Ipv4Addr::new(127, 0, 0, 1).into(),
        ];
        from_list(ip_list);

        let machines = get_machines();
        assert_eq!(machines.len(), 2);
        assert_eq!(machines[0].ip, "192.168.1.1");
        assert_eq!(machines[1].ip, "127.0.0.1");
    }

    #[test]
    fn test_change_machine_state() {
        reset_machines();

        let ip_list = vec![Ipv4Addr::new(192, 168, 1, 1).into()];
        from_list(ip_list);

        change_machine_state("192.168.1.1", "isolated");

        let machines = get_machines();
        assert_eq!(machines[0].status, "isolated");
    }

    #[test]
    fn test_change_machine_state_non_existent_ip() {
        reset_machines();

        let ip_list = vec![Ipv4Addr::new(192, 168, 1, 1).into()];
        from_list(ip_list);

        change_machine_state("10.0.0.1", "isolated");

        let machines = get_machines();
        assert_eq!(machines[0].status, "connected");
    }

    #[test]
    fn test_from_list() {
        reset_machines();

        let ip_list = vec![
            Ipv4Addr::new(192, 168, 1, 1).into(),
            Ipv4Addr::new(127, 0, 0, 1).into(),
            Ipv4Addr::new(8, 8, 8, 8).into(),
        ];
        from_list(ip_list);

        let machines = get_machines();
        assert_eq!(machines.len(), 3);
        assert_eq!(machines[0].ip, "192.168.1.1");
        assert_eq!(machines[1].ip, "127.0.0.1");
        assert_eq!(machines[2].ip, "8.8.8.8");
    }

    #[test]
    fn test_from_list_empty_ip_list() {
        reset_machines();

        let ip_list: Vec<IpAddr> = vec![];
        from_list(ip_list);

        let machines = get_machines();
        assert!(machines.is_empty());
    }
}