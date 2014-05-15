"use strict";

angular.module('arethusa.core').controller('ConfEditorCtrl', function($scope) {
  $scope.debug = true;
  $scope.toggleDebugMode = function() {
    $scope.debug = !$scope.debug;
  };

  // we might preload a conf file here, we need to parse this and populate these
  // variables with data from this file then.
  $scope.conf = {
    state: {
      retrievers: {},
      savers: {}
    },

   MainCtrl: {
     template: '',
     plugins: {}
   }
  };

  $scope.main = $scope.conf.MainCtrl;
  $scope.state = $scope.conf.state;

  // we need this to sort plugins in specific orders
  $scope.pluginList = [];

  $scope.getPlugin = function(name) {
    return $scope.main.plugins[name];
  };

  $scope.addPlugin = function() {
    var name = $scope.pluginInput;
    $scope.main.plugins[name] = { name: name, main: false };
    $scope.pluginList.push(name);
    $scope.pluginInput = '';
  };
});
