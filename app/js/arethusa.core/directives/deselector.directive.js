'use strict';
angular.module('arethusa.core').directive('deselector', [
  'state',
  function (state) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        element.bind('click', function (e) {
          state.deselectAll();
          scope.$apply();
        });
      }
    };
  }
]);