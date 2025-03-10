FROM rust:1.85.0

WORKDIR /app/

RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y curl ncat iptables supervisor

RUN apt-get clean

RUN touch /var/log/auth.log

COPY ./Cargo.toml /app/Cargo.toml
COPY ./src/ /app/src/
COPY ./ips.txt /app/ips.txt

RUN cargo build

COPY ./iptables-rules.sh /opt/iptables-rules.sh
RUN chmod +x /opt/iptables-rules.sh

COPY ./supervisord.conf /etc/supervisord.conf
ENTRYPOINT [ "/usr/bin/supervisord", "-c", "/etc/supervisord.conf" ]
