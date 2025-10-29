FROM node:25.0.0

WORKDIR /app/

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y make

COPY ./Makefile /app/Makefile

ENTRYPOINT [ "make" ]
