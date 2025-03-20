FROM ubuntu:22.04

WORKDIR /app/

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y nodejs npm

COPY ./Makefile /app/Makefile

ENTRYPOINT [ "make" ]
