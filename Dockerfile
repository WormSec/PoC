FROM rust:1.85.0

WORKDIR /app/

RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y curl ncat iptables supervisor net-tools
RUN apt-get install -y nodejs npm

RUN apt-get clean

RUN touch /var/log/auth.log

COPY ./iptables-rules.sh /opt/iptables-rules.sh
RUN chmod +x /opt/iptables-rules.sh

COPY ./ui/ /app/ui/

RUN bash -c "cd /app/ui/ && npm install"
RUN bash -c "cd /app/ui/ && npm run build"

COPY ./Cargo.toml /app/Cargo.toml
COPY ./src/ /app/src/
RUN cargo build

COPY ./ips.txt /app/ips.txt

COPY ./supervisord.conf /etc/supervisord.conf
ENTRYPOINT [ "/usr/bin/supervisord", "-c", "/etc/supervisord.conf" ]
