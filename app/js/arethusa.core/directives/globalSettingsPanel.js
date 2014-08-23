"use strict";

angular.module('arethusa.core').directive('globalSettingsPanel', [
  'globalSettings',
  'keyCapture',
  function(globalSettings, keyCapture) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.gS = globalSettings;
        scope.kC = keyCapture;

        scope.$watch('gS.active', function(newVal, oldVal) {
          scope.active = newVal;
          if (newVal) element.slideDown(); else element.slideUp();
        });
      },
      templateUrl: 'templates/arethusa.core/global_settings_panel.html'
    };
  }
]);

