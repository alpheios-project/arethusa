"use strict";

angular.module('arethusa.core').directive('arethusaGrid', [
  'arethusaGrid',
  'plugins',
  function(arethusaGrid, plugins) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        angular.element(document.body).css('overflow', 'auto');
        scope.grid = arethusaGrid;
      },
      templateUrl: 'templates/arethusa.core/arethusa_grid.html'
    };
  }
]);
