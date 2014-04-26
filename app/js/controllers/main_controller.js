"use strict";

annotationApp.controller('MainController', function($scope, state, configurator) {
  var conf = configurator.conf_for('MainController');

  $scope.partitionPlugins = function() {
    $scope.mainPlugins = [];
    $scope.subPlugins = [];

    angular.forEach(conf.plugins, function(el, name) {
      if (el.main) {
        $scope.mainPlugins.push(name);
      } else {
        $scope.subPlugins.push(name);
      }
    });
  };

  $scope.addPlugin = function() {
    $scope.plugins.push("comment");
  };

  $scope.state = state;
  $scope.plugins = Object.keys(conf.plugins);
  $scope.partitionPlugins();
  $scope.template = conf.template;
});
