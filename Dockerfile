FROM node:25.0.0

WORKDIR /app/

RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y curl ncat iptables supervisor net-tools
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

RUN apt-get clean

RUN touch /var/log/auth.log

COPY ./iptables-rules.sh /opt/iptables-rules.sh
RUN chmod +x /opt/iptables-rules.sh

COPY ./ui/ /app/ui/

RUN bash -c "cd /app/ui/ && npm install"
RUN bash -c "cd /app/ui/ && npm run build"

COPY ./Cargo.toml /app/Cargo.toml
COPY ./src/ /app/src/
RUN /root/.cargo/bin/cargo build

COPY ./ips.txt /app/ips.txt

COPY ./supervisord.conf /etc/supervisord.conf
ENTRYPOINT [ "/usr/bin/supervisord", "-c", "/etc/supervisord.conf" ]
