"use strict";

angular.module('arethusa-core').controller('MainController', function($scope, configurator, state) {
   var conf = configurator.configurationFor('MainController');

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

  console.log($scope.mainPlugins);

  $scope.switchTemplate = function() {
    if ($scope.template === "templates/main.html") {
      $scope.template = "templates/main2.html";
    } else {
      $scope.template = "templates/main.html";
    }
  };
});
