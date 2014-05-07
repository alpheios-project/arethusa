"use strict";

angular.module('arethusa.core').directive('nextToken', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      element.bind('click', function(e) {
        scope.state.selectNextToken();
        scope.$apply();
      });
    }
  };
});
