"use strict";

angular.module('arethusa.core').directive('editors', [
  'editors',
  function(editors) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.editors = editors;
      },
      templateUrl: 'templates/arethusa.core/editors.html'
    };
  }
]);
