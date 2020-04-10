

npm run bundle
rm -rf build
mkdir build
cp index.html build/
cp index.js build/
cp models/lastSaved build/model/ -r