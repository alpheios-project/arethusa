"use strict";

angular.module('arethusa.core').directive('gridItems', [
  'arethusaGrid',
  'plugins',
  function(arethusaGrid, plugins) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.grid = arethusaGrid;
        scope.plugins = plugins;
      },
      templateUrl: 'templates/arethusa.core/grid_items.html'
    };
  }
]);
