"use strict";

angular.module('arethusa.core').controller('SearchCtrl',
  function($scope, $location) {
  $scope.search = function() {
    $location.search("input", $scope.query);
  };
});
