"use strict";

angular.module('arethusa.core').directive('globalSettingsPanel', [
  'globalSettings',
  'keyCapture',
  '$timeout',
  function(globalSettings, keyCapture, $timeout) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.gS = globalSettings;
        scope.kC = keyCapture;

        scope.$watch('gS.active', function(newVal, oldVal) {
          scope.active = newVal;
          // Timeout to give the animation some breathing room.
          // In the first digest we activate the panel through ngIf,
          // in the following we make the element visible.
          $timeout(function() {
            if (newVal) element.slideDown(); else element.slideUp();
          }, 0, false);
        });

        scope.togglePluginSettings = togglePluginSettings;

        function togglePluginSettings() {
          scope.pluginSettingsVisible = !scope.pluginSettingsVisible;
        }
      },
      templateUrl: 'templates/arethusa.core/global_settings_panel.html'
    };
  }
]);

