'use strict';
angular.module('arethusa.confEditor').controller('morphConfCtrl', [
  '$scope',
  function ($scope) {
    $scope.colorizer = $scope.conf.styledThrough;
    $scope.colorizerObj = function () {
      return $scope.conf.attributes[$scope.colorizer] || {};
    };
    $scope.colorizerName = function () {
      return $scope.colorizerObj().long;
    };
  }
]);
