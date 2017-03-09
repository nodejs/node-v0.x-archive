# Dockerized node.js (compiled from source)
# VERSION           0.1.0
# DOCKER-VERSION    0.4.0
# To build:
# 1) Install docker (http://docker.io)
# 2) Start the docker daemon (`docker -d`)
# 3) run the docker build command with this file as input
#    `docker build -t $USER/node - < ./Dockerfile`
# 4) Your docker image is ready to be used!
#    `docker run $USER/node node -e 'console.log("Hello World!")'`
#

FROM ubuntu:12.10
RUN apt-get install -y wget python gcc make g++
RUN wget --no-check-certificate https://github.com/joyent/node/archive/master.tar.gz
RUN tar -xf master.tar.gz

RUN cd node-master; ./configure; make; make install
RUN rm -rf node-master; rm master.tar.gz

