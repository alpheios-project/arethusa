deploy_dir=$1
if [ ! $deploy_dir ]
then
  deploy_dir=dist_widget
fi
echo "Deploying to $deploy_dir"
if [ ! -e $deploy_dir ]
then
  mkdir $deploy_dir
  mkdir $deploy_dir/dist
fi
cp dist/arethusa.min.js $deploy_dir
cp dist/arethusa.min.map $deploy_dir
cp dist/arethusa_packages.min.js $deploy_dir/arethusa.packages.min.js
cp dist/* $deploy_dir/dist
