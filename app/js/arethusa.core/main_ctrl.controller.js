"use strict";

angular.module('arethusa.core').controller('MainCtrl', function($scope, $injector, configurator, state) {
  $scope.debug = false;
  $scope.toggleDebugMode = function() {
    $scope.debug = !$scope.debug;
  };

  var conf = configurator.configurationFor('main');

  $scope.colorize = conf.colorize;

  $scope.toggleColor = function() {
    $scope.colorize = ! $scope.colorize;
  };



  var partitionPlugins = function(plugins) {
    $scope.mainPlugins = [];
    $scope.subPlugins = [];
    $scope.pluginsWithMenu = [];

    angular.forEach(plugins, function(plugin, name) {
      $scope.registerPlugin(plugin);
    });
  };

  $scope.retrievePlugins = function(plugins) {
    var obj = {};
    angular.forEach(plugins, function(name, i) {
      obj[name] = $scope.retrievePlugin(name);
    });
    return obj;
  };

  $scope.registerPlugin = function(plugin) {
    $scope.pushPlugin(plugin);
    $scope.registerListener(plugin);
  };

  $scope.retrievePlugin = function(name) {
    var pluginConf = configurator.configurationFor(name);
    if (pluginConf.external) {
      // We copy because this object will be extended once the plugin
      // is really initialized through the inclusion of its template
      // by the plugin directive.
      return angular.copy(pluginConf);
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

    if (plugin.contextMenu) {
      $scope.pluginsWithMenu.push(plugin);
    }
  };

  // Working on the assumptions that plugins will generally be grouped
  // in something like a tabset - impossible to show them all at the same
  // time, we expose some variables and functions to get info about their
  // visibility.
  // Templates can use this to implement ngIf, which removes elements
  // temporarily from the DOM.
  // Very useful - example use case:
  //   We have the morph plugin included in our configuration, but have
  //   selected a different tab at the moment, i.e. we are displaying
  //   the view of another plugin. The morph view wouldn't have to be
  //   rendered in the background!
  //
  // As we will mostly likely listen to click events for this, we have
  // to declare a first visible plugin in the init() function of this
  // controller, otherwise a user wouldn't be able to see something when
  // he first loads the page.
  $scope.visiblePlugin = '';
  $scope.declareVisible = function(name) {
    $scope.visiblePlugin = name;
  };
  $scope.declareFirstPluginVisible = function() {
    $scope.declareVisible($scope.subPlugins[0].name);
  };

  $scope.isVisible = function(name) {
    return name === $scope.visiblePlugin;
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
  $scope.template = conf.template;

  // The application has to fulfil a specific load order.
  // The MainCtrl starts his work only when the configurator has received
  // its main configuration file (handled by the MAIN_ROUTE constant).
  //
  // The configurator might need some time to bring in external additional
  // files - asynchronously. We don't want the application to continue until
  // all configuration files are loaded.
  // We therefore wait for an event broadcast by the configurator to get a
  // green light.
  // Loading all state retrievers is another asynchronous step we want to see
  // completed before going on.
  // State broadcasts another event when it is done, after that the MainCtrl
  // can finally start to initialize itself and all all participating plugins.
  //
  // Everytime the state is reloaded, we need to reinitialize plugins (if they
  // declare to do so by implementing an init() function- it's not a necessity),
  // so that they can update their internal state after the main state tokens
  // have changed. There is no need to reinit the MainCtrl - the arethusaLoaded
  // variable takes care of this.
  // However if we reload a configuration, MainCtrl needs to be re-initialized
  // as well - the plugins participating in an editing session might have
  // changed completely. Therefore, the confLoaded event sets arethusaLoaded to
  // false every time it's triggered.
  $scope.$on('confLoaded', function() {
    $scope.arethusaLoaded = false;
    $scope.state.init();
  });

  $scope.$on('stateLoaded', function() {
    if ($scope.arethusaLoaded) {
      // We don't have to retrieve all plugins again, but we have
      // to reload them so that they can update their internal state
      $scope.initPlugins();
    } else {
      $scope.init();
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
    $scope.declareFirstPluginVisible();
    $scope.arethusaLoaded = true;
  };
});
