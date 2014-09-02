"use strict";

angular.module('arethusa.core').directive('arethusaGrid', [
  'arethusaGrid',
  'plugins',
  'globalSettings',
  '$timeout',
  function(arethusaGrid, plugins, globalSettings, $timeout) {
    return {
      restrict: 'A',
      scope: true, // inherit from ArethusaCtrl's scope
      link: function(scope, element, attrs) {
        angular.element(document.body).css('overflow', 'auto');

        scope.grid = arethusaGrid;

        function addSettings() {
          globalSettings.defineSetting('grid', 'custom', 'grid-setting');
        }

        function removeSettings() {
          globalSettings.removeSetting('grid');
        }

        // We need to timeout this, so that we can give globalSettings
        // time to define its own default settings - only afterwards
        // we add our own grid settings
        $timeout(addSettings);

        scope.$on('$destroy', removeSettings);
      },
      templateUrl: 'templates/arethusa.core/arethusa_grid.html'
    };
  }
]);
