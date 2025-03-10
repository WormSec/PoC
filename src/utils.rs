use std::{fs::File, io::{self, BufRead}, net::IpAddr, path::Path};

pub fn read_ips_from_file(filename: &str) -> io::Result<Vec<IpAddr>>
{
    let path = Path::new(filename);
    let file = File::open(path)?;
    let reader = io::BufReader::new(file);

    let ips = reader
        .lines()
        .filter_map(|line| line.ok()?.parse().ok())
        .collect();

    Ok(ips)
}