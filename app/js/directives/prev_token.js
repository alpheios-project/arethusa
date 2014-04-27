"use strict";

annotationApp.directive('prevToken', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      element.bind('click', function(e) {
        scope.state.selectPrevToken();
        scope.$apply();
      });
    }
  };
});
