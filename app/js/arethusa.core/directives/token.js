"use strict";

angular.module('arethusa.core').directive('token', function() {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      scope.$watch('colorize', function(newVal, oldVal) {
        if (newVal) {
          element.css(scope.token.style || {});
        } else {
          angular.forEach(scope.token.style, function(val, style) {
            element.css(style, '');
          });
        }
      });
    },
    templateUrl: 'templates/token.html'
  };
});
