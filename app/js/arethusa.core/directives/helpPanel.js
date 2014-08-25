"use strict";

angular.module('arethusa.core').directive('helpPanel', [
  'help',
  'keyCapture',
  'globalSettings',
  function(help, keyCapture, globalSettings) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.help = help;
        scope.kC = keyCapture;
        scope.gS = globalSettings;

        scope.$watch('help.active', function(newVal, oldVal) {
          scope.active = newVal;
          if (newVal) element.slideDown(); else element.slideUp();
        });
      },
      templateUrl: 'templates/arethusa.core/help_panel.html'
    };
  }
]);
