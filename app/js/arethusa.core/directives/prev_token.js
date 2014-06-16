'use strict';

angular.module('arethusa.core').directive('prevToken', [
  'state',
  function (state) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        element.bind('click', function (e) {
          scope.$apply(state.selectPrevToken());
        });
      }
    };
  }
]);
