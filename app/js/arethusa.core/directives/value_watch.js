'use strict';

angular.module('arethusa.core').directive('valueWatch', function () {
  return {
    restrict: 'A',
    scope: {
      target: '=',
      property: '@',
      emptyVal: '@'
    },
    link: function(scope, element, attrs) {
      scope.$watch('target.' + scope.property, function(newVal, oldVal) {
        if (newVal) {
          scope.value = newVal;
          element.removeClass('bold');
        } else {
          scope.value = scope.emptyVal || '';
          element.addClass('bold');
        }
      });
    },
    template: '<span>{{ value }}</span>'
  };
});
