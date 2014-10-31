"use strict";

angular.module('arethusa.core').directive('helpPanel', [
  'help',
  'keyCapture',
  'globalSettings',
  'versioner',
  '$timeout',
  function(help, keyCapture, globalSettings, versioner, $timeout) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.help = help;
        scope.kC = keyCapture;
        scope.gS = globalSettings;
        scope.vers = versioner;

        scope.visible = {};

        scope.toggle = function(param) {
          scope.visible[param] = !scope.visible[param];
        };

        scope.$watch('help.active', function(newVal, oldVal) {
          scope.active = newVal;
          $timeout(function() {
            if (newVal) {
              element.slideDown();
            } else {
              element.slideUp();
              scope.visible = {};
            }
          });
        });
      },
      templateUrl: 'templates/arethusa.core/help_panel.html'
    };
  }
]);
