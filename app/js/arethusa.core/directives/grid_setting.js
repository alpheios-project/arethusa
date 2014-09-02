"use strict";

angular.module('arethusa.core').directive('gridSetting', [
  'arethusaGrid',
  function(arethusaGrid) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.grid = arethusaGrid;
        scope.settings = arethusaGrid.settings;
      },
      templateUrl: 'templates/arethusa.core/grid_setting.html'
    };
  }
]);
