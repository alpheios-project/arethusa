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

        var options = ['dragging', 'resizing', 'floating', 'pushing'];
        angular.forEach(options, function(option) {
          scope.$watch('settings.' + option, function(newVal, oldVal) {
            if (newVal !== oldVal) {
              arethusaGrid['set' + aU.capitalize(option)](newVal);
            }
          });
        });
      },
      templateUrl: 'templates/arethusa.core/grid_setting.html'
    };
  }
]);
