"use strict";

angular.module('arethusa.core').controller('ConfEditorCtrl', function($scope, configurator) {
  $scope.debug = false;
  $scope.toggleDebugMode = function() {
    $scope.debug = !$scope.debug;
  };

  // we might preload a conf file here, we need to parse this and populate these
  // variables with data from this file then.
  $scope.conf = configurator.configuration;
  $scope.filePath = configurator.confFileLocation;
  $scope.fileName = function() {
    return $scope.filePath.replace(/^.*configs\//, '');
  };

  // some delegators
  $scope.main = $scope.conf.main;
  $scope.navbar = $scope.conf.navbar;
  $scope.plugins = $scope.conf.plugins;
  $scope.retrievers = $scope.conf.retrievers;
  $scope.resources = $scope.conf.resources;

  $scope.pluginConf = function(name) {
    return $scope.plugins[name];
  };

  $scope.isMainPlugin = function(name) {
    return $scope.pluginConf(name).main;
  };
});
