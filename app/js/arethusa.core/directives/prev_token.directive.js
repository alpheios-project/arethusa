'use strict';
angular.module('arethusa.core').directive('prevToken', function () {
  return {
    restrict: 'E',
    link: function (scope, element, attrs) {
      element.bind('click', function (e) {
        scope.state.selectPrevToken();
        scope.$apply();
      });
    }
  };
});