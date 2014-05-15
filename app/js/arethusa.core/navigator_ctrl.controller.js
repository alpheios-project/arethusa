"use strict";

angular.module('arethusa.core').controller('NavigatorCtrl', function($scope, navigator) {
  $scope.next = function() {
    navigator.nextSentence();
  };

  $scope.prev = function() {
    navigator.prevSentence();
  };

  $scope.navStat= navigator.status;
});
