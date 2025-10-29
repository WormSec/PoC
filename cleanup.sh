#!/bin/bash

echo "This script make an ENTIRE cleanup of the Docker setup (all volumes, networks, and this compose's images)"

echo -n "Do you want to continue ? (Press Ctrl+C to stop)"
read

echo "Purgeing docker"

SUDO=""
DOCKER_COMPOSE="docker-compose"

if ! command -v $DOCKER_COMPOSE 2>&1 >/dev/null; then
    DOCKER_COMPOSE="docker compose"
fi

if [ $(test -r /var/run/docker.sock; echo "$?") -ne 0 ]; then
    SUDO="sudo"
fi

$SUDO $DOCKER_COMPOSE stop
$SUDO $DOCKER_COMPOSE rm -f
$SUDO docker network rm $($SUDO docker network ls -q) 2>/dev/null
$SUDO docker volume rm $($SUDO docker volume ls -q) 2>/dev/null

PROJECT_NAME=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr -d '.')

$SUDO docker rmi $($SUDO docker images --format "{{.Repository}}:{{.Tag}}" | grep "^${PROJECT_NAME}-")

# Remove ./data/ without hard requireing sudo
# Run a container, mounting the current directory within, and removeing the content of that directory

if [[ $($SUDO docker image ls -aq | wc -c) -eq 0 ]]; then
    $SUDO docker pull alpine:3.21.3
fi

$SUDO docker run -it --rm -v "$PWD":/host/ --user root --entrypoint "/bin/rm" $($SUDO docker image ls -aq | head -n 1) -rf /host/data/

echo "Cleared the project"
