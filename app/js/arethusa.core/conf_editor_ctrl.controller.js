"use strict";

angular.module('arethusa.core').controller('ConfEditorCtrl', function($scope) {
  $scope.debug = false;
  $scope.toggleDebugMode = function() {
    $scope.debug = !$scope.debug;
  };
  $scope.conf = {
    state: {
      retrievers: {},
      savers: {},
    }
  };
});
