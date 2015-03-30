"use strict";

angular.module('arethusa.core').directive('helpPanel', [
  'help',
  'keyCapture',
  'globalSettings',
  'versioner',
  'notifier',
  '$timeout',
  function(help, keyCapture, globalSettings, versioner, notifier, $timeout) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.help = help;
        scope.kC = keyCapture;
        scope.gS = globalSettings;
        scope.vers = versioner;
        scope.notifier = notifier;

        scope.visible = {};

        // Extract to a service
        scope.tools = [
          {
            label: 'Import/Export your morphological data',
            hint: 'Vla',
            href: '#/morph_tools'
          }
        ];

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
