"use strict";

annotationApp.directive('nextToken', function() {
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
