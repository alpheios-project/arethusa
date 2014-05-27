'use strict';
angular.module('arethusa.core').directive('valueWatch', function () {
  return {
    restrict: 'A',
    scope: {
      target: '=',
      property: '@'
    },
    template: '<span>{{ target[property] }}</span>'
  };
});