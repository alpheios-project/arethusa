"use strict";

annotationApp.directive('token', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'templates/token.html'
  };
});
