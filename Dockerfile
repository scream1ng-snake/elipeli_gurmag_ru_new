FROM node:lts-slim
COPY . .
RUN apt-get -y update
RUN apt-get -y install git
RUN apt-get -y install nginx
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 6564
CMD ["/bin/bash", "/update.sh"]
