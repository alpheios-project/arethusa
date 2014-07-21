"use strict";

angular.module('arethusa.core').directive('helpPanel', [
  'help',
  'keyCapture',
  function(help, keyCapture) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.help = help;
        scope.kC = keyCapture;

        scope.$watch('help.active', function(newVal, oldVal) {
          scope.active = newVal;
          if (newVal) element.slideDown(); else element.slideUp();
        });
      },
      templateUrl: 'templates/arethusa.core/help_panel.html'
    };
  }
]);
