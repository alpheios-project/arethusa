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
    $scope.goToFirst = function() {
      navigator.goToFirst();
    };
    $scope.goToLast = function() {
      navigator.goToLast();
    };
    $scope.goTo = function(id) {
      navigator.goTo(id);
    };
    $scope.navStat = navigator.status;
  }
]);
