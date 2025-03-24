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

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn create_temp_file_with_ips(contents: &str) -> io::Result<String> {
        let tmp_dir = std::env::temp_dir();
        let tmp_file_path = tmp_dir.join("test_ips.txt");
        let mut file = File::create(&tmp_file_path)?;
        file.write_all(contents.as_bytes())?;
        Ok(tmp_file_path.to_str().unwrap().to_string())
    }

    #[test]
    fn test_read_ips_from_file_success() {
        let contents = "192.168.1.1\n127.0.0.1\n8.8.8.8\n";
        let file_path = create_temp_file_with_ips(contents).unwrap();

        let result = read_ips_from_file(&file_path);
        assert!(result.is_ok());

        let ips = result.unwrap();
        assert_eq!(ips.len(), 3);
        assert_eq!(ips[0], "192.168.1.1".parse::<IpAddr>().unwrap());
        assert_eq!(ips[1], "127.0.0.1".parse::<IpAddr>().unwrap());
        assert_eq!(ips[2], "8.8.8.8".parse::<IpAddr>().unwrap());
    }

    #[test]
    fn test_read_ips_from_file_empty_file() {
        let contents = "";
        let file_path = create_temp_file_with_ips(contents).unwrap();

        let result = read_ips_from_file(&file_path);
        assert!(result.is_ok());

        let ips = result.unwrap();
        assert_eq!(ips.len(), 0);
    }

    #[test]
    fn test_read_ips_from_file_file_not_found() {
        let result = read_ips_from_file("non_existent_file.txt");
        assert!(result.is_err());
    }
}