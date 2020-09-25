FROM nvidia/cuda:10.0-cudnn7-runtime-ubuntu18.04

RUN apt-get update
RUN apt-get -y install gcc g++  make curl dirmngr apt-transport-https lsb-release ca-certificates
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -

RUN apt-get install --yes nodejs \
    && node -v

ADD ./* $HOME/
RUN ls
RUN npm install

RUN echo "$PWD"

RUN mkdir models

RUN ls

ENTRYPOINT ["sh", "-c", "node trainEvol.js"]