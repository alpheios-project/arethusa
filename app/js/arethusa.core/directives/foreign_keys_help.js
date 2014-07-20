'use strict';
angular.module('arethusa.core').directive('foreignKeysHelp', [
  'keyCapture',
  function(keyCapture) {
    return {
      restrict: 'AE',
      link: function(scope, element, attr) {
        var shiftersBound = false;

        // Will be added lazily through a watch
        var shifters;

        function generateKeys() {
          scope.keys = keyCapture.mappedKeyboard('gr', scope.shifted);
        }

        function bindShift() {
          scope.$apply(function() {
            scope.shifted = !scope.shifted;
            generateKeys();
          });
        }

        var shifterWatch = scope.$watch('visible', function(newVal, oldVal) {
          if (newVal && !shiftersBound) {
            shifters = element.find('.shifter');
            shifters.bind('click', bindShift);
            shifterWatch();
          }
        });

        scope.$watch('shifted', function(newVal, oldVal) {
          if (shifters) {
            if (newVal) {
              shifters.addClass('shift-clicked');
            } else {
              shifters.removeClass('shift-clicked');
            }
          }
        });

        generateKeys();
      },
      templateUrl: './templates/arethusa.core/foreign_keys_help.html'
    };
  }
]);
