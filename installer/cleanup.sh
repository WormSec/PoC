#!/bin/bash

if [ `id -u` -ne 0 ]; then
    echo "Please run the installer as root !"
    exit 1
fi

systemctl stop wormsec
systemctl disable wormsec

rm -rf /etc/systemd/system/wormsec.service
rm -rf /etc/wormsec
