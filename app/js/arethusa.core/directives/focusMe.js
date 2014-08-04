"use strict";

angular.module('arethusa.core').directive('focusMe', [
  function() {
    return {
      restrict: 'A',
      scope: {
        focus: '=focusMe'
      },
      link: function(scope, element, attrs) {
        scope.$watch('focus', function(newVal, oldVal) {
          if (newVal) element.focus();
        });
      },
    };
  }
]);
