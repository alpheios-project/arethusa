"use strict";

angular.module('arethusa').directive('deselector', function() {
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
