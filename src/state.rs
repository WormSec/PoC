use serde::{Serialize, Deserialize};
use std::{net::IpAddr, sync::{Arc, Mutex}};
use once_cell::sync::Lazy;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Machine {
    pub id: String,
    pub name: String,
    pub ip: String,
    pub mac: String,
    pub last_update: String,
    pub status: String,
}

pub static MACHINES: Lazy<Arc<Mutex<Vec<Machine>>>> = Lazy::new(|| {Arc::new(Mutex::new(Vec::new()))});


pub fn get_machines() -> Vec<Machine>
{
    let machines = MACHINES.lock().unwrap();
    machines.clone()
}

pub fn change_machine_state(ip: &str, new_status: &str)
{
    let mut machines = MACHINES.lock().unwrap();
    if let Some(machine) = machines.iter_mut().find(|m| m.ip == ip) {
        machine.status = new_status.to_string();
    }
}

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