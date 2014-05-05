"use strict";

angular.module('arethusa-core').controller('MainController', function($scope, configurator, state) {
  var conf = configurator.configurationFor('MainController');

  // This is a really really bad solution right now. Using the controller
  // to insert stuff into the state object is not good. Can only stay as
  // a temporary prototype solution.
  var partitionPlugins = function(plugins) {
    $scope.mainPlugins = [];
    $scope.subPlugins = [];

    angular.forEach(plugins, function(plugin, name) {
      var toPush;
      if (plugin.external) {
        /* global externalPlugins */
        toPush = window.externalPlugins[name];
        toPush = angular.extend(toPush, configurator.configurationFor(name));
        $scope.pushPlugin(toPush, toPush.main);
      } else {
        $scope.pushPlugin(name, plugin.main);
      }
    });
  };

  $scope.pushPlugin = function(plugin, main) {
    if (main) {
      $scope.mainPlugins.push(plugin);
    } else {
      $scope.subPlugins.push(plugin);
    }
  };

  $scope.addPlugin = function() {
    $scope.plugins.push("comment");
  };

  $scope.state = state;
  $scope.plugins = Object.keys(conf.plugins);

  partitionPlugins(conf.plugins);

  $scope.template = conf.template;

  $scope.switchTemplate = function() {
    if ($scope.template === "templates/main.html") {
      $scope.template = "templates/main2.html";
    } else {
      $scope.template = "templates/main.html";
    }
  };
});
