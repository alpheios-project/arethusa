"use strict";

angular.module('arethusa').directive('nextToken', function() {
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
