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
          scope.empty = false;
        } else {
          scope.value = scope.emptyVal || '';
          scope.empty = true;
        }
      });
    },
    template: '<span ng-class="{ bold: empty }">{{ value }}</span>'
  };
});
