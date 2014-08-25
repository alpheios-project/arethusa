'use strict';
angular.module('arethusa.core').directive('valueWatch', function () {
  return {
    restrict: 'A',
    scope: {
      target: '=',
      property: '@',
      emptyVal: '@'
    },
    template: '<span>{{ target[property] || emptyVal }}</span>'
  };
});
