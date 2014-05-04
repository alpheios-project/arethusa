"use strict";

angular.module('arethusa.core').controller('SearchController',
  function($scope, $location) {
  $scope.search = function() {
    $location.search("input", $scope.query);
  };
});
