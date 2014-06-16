'use strict';

angular.module('arethusa.core').directive('nextToken', [
  'state',
  function (state) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        element.bind('click', function (e) {
          scope.$apply(state.selectNextToken());
        });
      }
    };
  }
]);
