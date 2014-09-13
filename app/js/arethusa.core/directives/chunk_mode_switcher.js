"use strict";

angular.module('arethusa.core').directive('chunkModeSwitcher', [
  'navigator',
  'globalSettings',
  function(navigator, globalSettings) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.navi = navigator;
        scope.label = globalSettings.settings.chunkMode.label;
      },
      templateUrl: 'templates/arethusa.core/chunk_mode_switcher.html'
    };
  }
]);
