'use strict';
angular.module('arethusa.core').directive('foreignKeys',[
  'keyCapture',
  'languageSettings',
  '$compile',
  function (keyCapture, languageSettings, $compile) {
    return {
      restrict: 'A',
      scope: {
        ngChange: '&',
        ngModel: '@',
        foreignKeys: '='
      },
      link: function (scope, element, attrs) {
        var parent = scope.$parent;

        function extractLanguage() {
          return (languageSettings.getFor('treebank') || languageSettings.getFor('hebrewMorph') || {}).lang;
        }

        function lang() {
          return scope.foreignKeys || extractLanguage();
        }

        function activeLanguage() {
          return languageSettings.langNames[lang()];
        }

        // This will not detect changes right now
        function placeHolderText() {
          var language = activeLanguage();
          return  language ? language + ' input enabled!' : '';
        }

        function broadcast(event) {
          scope.$broadcast('convertingKey', event.keyCode);
        }

        function appendHelp() {
          if (!activeLanguage()) return;

          var parent = element.parent();
          var margin = element.css('margin');

          var trigger   = '<span ng-click="visible = !visible">⌨</span>';
          var help      = '<div foreign-keys-help/>';
          var newMargin = '<div style="margin: ' + margin + '"/>';


          element.css('margin', 0);
          parent.append($compile(trigger)(scope));
          parent.append($compile(help)(scope));
          parent.append(newMargin);
        }

        element.attr('placeholder', placeHolderText);
        appendHelp();

        scope.parseEvent = function (event) {
          var input = element[0].value;
          var l = lang();
          if (l) {
            var fK = keyCapture.getForeignKey(event, l);
            if (fK === false) {
              broadcast(event);
              return false;
            }
            if (fK === undefined) {
              return true;
            } else {
              broadcast(event);
              element[0].value = input + fK;
              scope.$apply(function() {
                parent.$eval(scope.ngModel + ' = i + k', { i: input, k: fK });
                scope.ngChange();
              });
              return false;
            }
          } else {
            return true;
          }
        };

        element.on('keydown', scope.parseEvent);
      }
    };
  }
]);
