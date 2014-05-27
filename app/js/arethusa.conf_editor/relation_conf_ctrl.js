'use strict';
angular.module('arethusa.confEditor').controller('relationConfCtrl', [
  '$scope',
  function ($scope) {
    $scope.labels = $scope.conf.relations.labels;
  }
]);
