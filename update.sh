exho "update started"
serve -s build -l 6564
echo "static serve started" 
git pull
echo "actual changes loaded from remote"
npm i
echo "deps installed"
npm run build
echo "last commit builded"