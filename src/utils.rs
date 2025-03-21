use std::{fs::File, io::{self, BufRead}, net::IpAddr, path::Path};

/// Reads IP addresses from a file and returns them as a vector.
///
/// This function opens a file at the provided `filename` path, reads each line, attempts
/// to parse the line as an `IpAddr`, and collects the successfully parsed IPs into a vector.
///
/// # Arguments
///
/// * `filename` - The path to the file containing the IP addresses (one IP per line).
///
/// # Returns
///
/// * `Ok(Vec<IpAddr>)` - A vector containing the parsed IP addresses from the file.
/// * `Err(io::Error)` - An error if the file cannot be opened or there is an issue reading the file.
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