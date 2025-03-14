use serde::{Serialize, Deserialize};
use std::{net::IpAddr, sync::Arc};
use tokio::sync::RwLock;
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

pub static MACHINES: Lazy<Arc<RwLock<Vec<Machine>>>> = Lazy::new(|| {Arc::new(RwLock::new(Vec::new()))});

pub async fn get_machines() -> Vec<Machine>
{
    let machines = MACHINES.read().await;
    machines.clone()
}

pub async fn change_machine_state(ip: &str, new_status: &str)
{
    let mut machines = MACHINES.write().await;
    if let Some(machine) = machines.iter_mut().find(|m| m.ip == ip) {
        machine.status = new_status.to_string();
    }
}

pub async fn from_list(ip_list: Vec<IpAddr>)
{
    let mut machines = MACHINES.write().await;
    *machines = ip_list
        .iter()
        .enumerate()
        .map(|(i, ip)| Machine {
            id: (i + 1).to_string(),
            name: (i + 1).to_string(),
            ip: ip.to_string(),
            mac: "AA:BB:CC:DD:EE:FF".to_string(),
            last_update: "N/A".to_string(),
            status: "connected".to_string(),
        })
        .collect();
}