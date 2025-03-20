#!/bin/bash

SUDO=""

if [ $(test -r /var/run/docker.sock; echo "$?") -ne 0 ]; then
    SUDO="sudo"
fi

cd "$(dirname "$(realpath "$0")")"

$SUDO docker rmi wormsec-poc-installer 2>/dev/null
$SUDO docker build -t wormsec-poc-installer .

cd ../

$SUDO docker run -it --rm -v ./:/app/host/ wormsec-poc-installer pack
