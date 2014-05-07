"use strict";

angular.module('arethusa.core').directive('token', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'templates/token.html'
  };
});
