"use strict";

annotationApp.directive('deselector', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      element.bind('click', function(e) {
        scope.state.deselectAll();
        scope.$apply();
      });
    }
  };
});
