"use strict";

angular.module('arethusa-core').controller('MainController', function($scope, $injector, configurator, state) {
  var conf = configurator.configurationFor('MainController');

  var partitionPlugins = function(plugins) {
    $scope.mainPlugins = [];
    $scope.subPlugins = [];

    angular.forEach(plugins, function(plugin, name) {
      var toPush = $scope.retrievePlugin(name, plugin);
      $scope.registerPlugin(toPush);
    });
  };

  $scope.registerPlugin = function(plugin) {
    $scope.pushPlugin(plugin);
    $scope.registerListener(plugin);
  };

  $scope.retrievePlugin = function(name, plugin) {
    if (plugin.external) {
      return configurator.configurationFor(name);
    } else {
      return  $injector.get(name);
    }
  };

  $scope.pushPlugin = function(plugin) {
    if (plugin.main) {
      $scope.mainPlugins.push(plugin);
    } else {
      $scope.subPlugins.push(plugin);
    }
  };

  // This is a really really bad solution right now. Using the controller
  // to insert stuff into the state object is not good. Can only stay as
  // a temporary prototype solution.
  $scope.registerListener = function(plugin) {
    if (plugin.listener) {
      state.registerListener(plugin);
    }
  };

  $scope.addPlugin = function() {
    $scope.plugins.push("comment");
  };

  $scope.switchTemplate = function() {
    if ($scope.template === "templates/main.html") {
      $scope.template = "templates/main2.html";
    } else {
      $scope.template = "templates/main.html";
    }
  };

  $scope.state = state;
  $scope.plugins = Object.keys(conf.plugins);
  $scope.template = conf.template;

  partitionPlugins(conf.plugins);
});
