"use strict";

angular.module('arethusa').directive('token', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'templates/token.html'
  };
});
