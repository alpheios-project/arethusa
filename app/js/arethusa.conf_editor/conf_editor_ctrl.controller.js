"use strict";

angular.module('arethusa.confEditor').controller('ConfEditorCtrl', function($scope, configurator, confUrl, $http) {
  $scope.conf = configurator.loadConfTemplate;
  $scope.filePath = '';

  // If we have specified a conf file to preload, we fetch it here
  // asynchronously.
  // As we have already set an empty confTemplate, the site can
  // start to render itself without errors before this is finished.
  $scope.loadFileToEdit = function() {
    var url = confUrl();
    if (url) {
      $http.get(url).then(function(res) {
        var conf = configurator.loadConfFile(res.data, url);
        $scope.conf     = conf.data;
        $scope.filePath = conf.location;
      });
    }
  };

  $scope.debug = false;
  $scope.toggleDebugMode = function() {
    $scope.debug = !$scope.debug;
  };

  $scope.fileName = function() {
    return $scope.filePath.replace(/^.*configs\//, '');
  };

  // some delegators
  $scope.main = function() { return $scope.conf.main; };
  $scope.navbar = function() { return $scope.conf.navbar; };
  $scope.plugins = function() { return $scope.conf.plugins; };
  $scope.retrievers = function() { return $scope.conf.retrievers; };
  $scope.resources = function() { return $scope.conf.resources; };

  $scope.pluginConf = function(name) {
    return $scope.plugins()[name];
  };

  $scope.isMainPlugin = function(name) {
    return $scope.pluginConf(name).main;
  };

  // Saving configuration files
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

  // Adding a resource
  var createResourceConf = function() {
    return {
      route: '',
      params: []
    };
  };

  $scope.addResource = function() {
    $scope.resources()[$scope.resourceName] = createResourceConf();
    $scope.resourceName = '';
  };

  $scope.deleteResource = function(name) {
    delete $scope.resource()[name];
  };

  // Initialize the controller
  $scope.loadFileToEdit();
});
