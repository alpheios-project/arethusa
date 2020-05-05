deploy_dir=$1
if [ ! $deploy_dir ]
then
  deploy_dir=dist_widget
fi
echo "Deploying to $deploy_dir"

mkdir -p $deploy_dir/dist
mkdir -p $deploy_dir/css
mkdir -p $deploy_dir/fonts
mkdir -p $deploy_dir/vendor/dagre-d3
mkdir -p $deploy_dir/vendor/d3-3.4.13
mkdir -p $deploy_dir/i18n

cp dist/arethusa.min.js $deploy_dir
cp dist/arethusa.min.map $deploy_dir
cp dist/arethusa_packages.min.js $deploy_dir/arethusa.packages.min.js
cp dist/* $deploy_dir/dist
cp dist/i18n/* $deploy_dir/i18n/

cp vendor/angular-foundation-colorpicker/css/colorpicker.css $deploy_dir/css/colorpicker.css
cp vendor/font-awesome-4.1.0/css/font-awesome.min.css $deploy_dir/css/font-awesome.min.css
cp vendor/foundation-icons/foundation-icons.* $deploy_dir/css/

cp vendor/font-awesome-4.1.0/fonts/* $deploy_dir/fonts/

cp app/js/arethusa.widget.loader.js $deploy_dir/arethusa.widget.loader.js

cp vendor/dagre-d3/dagre-d3.min.js $deploy_dir/vendor/dagre-d3/dagre-d3.min.js
cp vendor/dagre-d3/dagre-d3.min.map $deploy_dir/vendor/dagre-d3/dagre-d3.min.map
cp vendor/d3-3.4.13/d3.min.js $deploy_dir/vendor/d3-3.4.13/d3.min.js
cp vendor/angularJS-toaster/toaster.min.map $deploy_dir
