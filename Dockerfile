FROM node:lts-slim

COPY . .

RUN npm i
RUN npm install -g serve
RUN apt-get -y update
RUN apt-get -y install git

EXPOSE 6564


CMD serve -s build -l 6564 ; git pull ; npm run build