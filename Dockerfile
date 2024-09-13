FROM node:lts-slim

COPY . .

RUN npm install -g serve
RUN apt-get -y update
RUN apt-get -y install git

EXPOSE 6564


CMD ["/bin/bash", "/update.sh"]