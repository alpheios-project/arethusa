"use strict";

angular.module('arethusa.core').controller('ConfEditorCtrl', function($scope, configurator, $http) {
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

  $scope.save = function(filename) {
    var request = {
      path: $scope.filePath,
      data: $scope.conf
    };

    // This is currently hardcoded and awaits the llt-arethusa-file_server
    // running locally on port 8086.
    // Check http://github.com/latin-language-toolkit/llt-arethusa-file_server
    $http.post('http://localhost:8086/write', request).
      // will go in the notification bar once we have it
      success(function(res) {
        arethusaLogger.log('File saved');
      }).
      error(function(res) {
        arethusaLogger.log('Error while saving file');
      });
  };


});
