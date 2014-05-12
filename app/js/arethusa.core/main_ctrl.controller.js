"use strict";

angular.module('arethusa.core').controller('MainCtrl', function($scope, $injector, configurator, state) {
  $scope.debug = false;
  $scope.toggleDebugMode = function() {
    $scope.debug = !$scope.debug;
  };

  var conf = configurator.configurationFor('MainCtrl');

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
  $scope.state.init();
  $scope.template = conf.template;

  $scope.$watch('state.allLoaded', function(newVal, oldVal) {
    if (newVal) {
      if ($scope.arethusaLoaded) {
        // We don't have to retrieve all plugins again, but we have
        // to reload them so that they can update their internal state
        $scope.initPlugins();
      } else {
        $scope.init();
      }
    }
  });

  $scope.initPlugins = function() {
    for (var plugin in $scope.plugins) {
      try {
        $scope.plugins[plugin].init();
      } catch(err) {
        // implement init function for all plugins
      }
    }
  };

  $scope.init = function() {
    $scope.plugins = $scope.retrievePlugins(conf.plugins);
    partitionPlugins($scope.plugins);
    $scope.initPlugins();
    $scope.arethusaLoaded = true;
  };
});
