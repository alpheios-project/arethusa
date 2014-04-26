annotationApp.controller('MainController', function($scope, state, configurator) {
  var conf = configurator.conf_for('MainController');

  $scope.state = state;
  $scope.plugins = conf.plugins;
  $scope.template = conf.template;

  $scope.addPlugin = function() {
    $scope.plugins.push("comment");
  };
});
