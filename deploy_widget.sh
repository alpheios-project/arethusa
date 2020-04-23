deploy_dir=$1
if [ ! $deploy_dir ]
then
  deploy_dir=dist_widget
fi
echo "Deploying to $deploy_dir"

mkdir -p $deploy_dir/dist
mkdir -p $deploy_dir/../vendor/d3-3.4.13/

cp dist/arethusa.min.js $deploy_dir
cp dist/arethusa.min.map $deploy_dir
cp dist/arethusa_packages.min.js $deploy_dir/arethusa.packages.min.js
cp dist/* $deploy_dir/dist
cp vendor/d3-3.4.13/d3.min.js $deploy_dir/../vendor/d3-3.4.13/d3.min.js
