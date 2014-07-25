'use strict';

// TODO
//
// Extract a foreignKeys service which handles common operations

angular.module('arethusa.core').directive('foreignKeysHelp', [
  'keyCapture',
  'languageSettings',
  '$timeout',
  function(keyCapture, languageSettings, $timeout) {
    return {
      restrict: 'AE',
      scope: true,
      link: function(scope, element, attr) {
        var shiftersBound = false;

        // Will be added lazily through a watch
        var shifters;

        function generateKeys() {
          var lang = (languageSettings.getFor('treebank') || languageSettings.getFor('hebrewMorph') || {}).lang;
          scope.keys = keyCapture.mappedKeyboard(lang, scope.shifted);
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

        scope.$on('convertingKey', function(event, keyCode) {
          if (scope.visible) {
            var key = element.find('#' + keyCapture.codeToKey(keyCode));
            key.addClass('key-hit');
            $timeout(function() {
              key.removeClass('key-hit');
            }, 750);
          }
        });

        generateKeys();
      },
      templateUrl: './templates/arethusa.core/foreign_keys_help.html'
    };
  }
]);
