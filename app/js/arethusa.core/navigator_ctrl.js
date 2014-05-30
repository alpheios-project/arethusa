'use strict';
angular.module('arethusa.core').controller('NavigatorCtrl', [
  '$scope',
  'navigator',
  function ($scope, navigator) {
    $scope.next = function () {
      navigator.nextSentence();
    };
    $scope.prev = function () {
      navigator.prevSentence();
    };
    $scope.hasNext = function() {
      return navigator.hasNext();
    };
    $scope.hasPrev = function() {
      return navigator.hasPrev();
    };
    $scope.navStat = navigator.status;
  }
]);
