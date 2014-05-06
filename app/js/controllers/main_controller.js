"use strict";

angular.module('arethusa-core').controller('MainController', function($scope, $injector, configurator, state) {
  var conf = configurator.configurationFor('MainController');

  var partitionPlugins = function(plugins) {
    $scope.mainPlugins = [];
    $scope.subPlugins = [];

    angular.forEach(plugins, function(plugin, name) {
      $scope.registerPlugin(plugin);
    });
  };

  $scope.retrievePlugins = function(plugins) {
    var obj = {};
    angular.forEach(plugins, function(conf, name) {
      obj[name] = $scope.retrievePlugin(name, conf);
    });
    return obj;
  };

  $scope.registerPlugin = function(plugin) {
    $scope.pushPlugin(plugin);
    $scope.registerListener(plugin);
  };

  $scope.retrievePlugin = function(name, plugin) {
    if (plugin.external) {
      // We copy because this object will be extended once the plugin
      // is really initialized through the inclusion of its template
      // by the plugin directive.
      return angular.copy(configurator.configurationFor(name));
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

  $scope.state = state;
  $scope.plugins = $scope.retrievePlugins(conf.plugins);
  $scope.template = conf.template;

  partitionPlugins($scope.plugins);
});
