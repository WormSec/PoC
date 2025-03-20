#!/bin/bash

if [ `id -u` -ne 0 ]; then
    echo "Please run as root !"
    exit 1
fi

iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT
iptables -t nat -F
iptables -t mangle -F
iptables -F
iptables -X

systemctl restart wormsec
