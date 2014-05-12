"use strict";

angular.module('arethusa.core').controller('SearchCtrl', function($scope, locator) {
  $scope.search = function() {
    locator.setUri("treebank", $scope.query);
  };
});
