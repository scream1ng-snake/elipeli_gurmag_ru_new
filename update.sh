#!/bin/bash
echo "[update]:"
git pull
echo "[update] - done, actual changes loaded from remote"
echo "[install deps]:"
npm i
echo "[install deps] - done"
echo "[building]:"
npm run build
echo "[building] - done, last commit builded"
echo "[NGINX]: starting"
/usr/sbin/nginx -g 'daemon off;'