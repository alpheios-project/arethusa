'use strict';
angular.module('arethusa.core').directive('greekKeys',[
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
          if (lang == "gr") {
            var gr = keyCapture.getGreekKey(event);
            if (gr === false) {
              return false;
            }
            if (gr === undefined) {
              return true;
            } else {
              event.target.value = input + gr;
              scope.$apply(function() {
                parent.$eval(scope.ngModel + ' = i + g', { i: input, g: gr });
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
