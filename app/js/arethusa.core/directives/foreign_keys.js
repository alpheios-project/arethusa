'use strict';
angular.module('arethusa.core').directive('foreignKeys',[
  'keyCapture',
  'languageSettings',
  function (keyCapture, languageSettings) {
    return {
      restrict: 'A',
      scope: {
        ngChange: '&',
        ngModel: '@'
      },
      link: function (scope, element, attrs) {
        var parent = scope.$parent;

        element.on('keydown', function (event) {
          var lang = (languageSettings.getFor('treebank') || {}).lang;
          var input = event.target.value;
          if (lang) {
            var fK = keyCapture.getForeignKey(event, lang);
            if (fK === false) {
              return false;
            }
            if (fK === undefined) {
              return true;
            } else {
              event.target.value = input + fK;
              scope.$apply(function() {
                parent.$eval(scope.ngModel + ' = i + k', { i: input, k: fK });
                scope.ngChange();
              });
              return false;
            }
          } else {
            return true;
          }
        });
      }
    };
  }
]);
