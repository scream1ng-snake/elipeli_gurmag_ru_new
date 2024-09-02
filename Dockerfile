FROM node:lts-slim

COPY . .

RUN npm i
RUN npm run build
RUN npm install -g serve

EXPOSE 6564


CMD serve -s build -l 6564