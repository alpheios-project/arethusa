'use strict';
angular.module('arethusa.core').directive('greekKeys',[
  'keyCapture',
  'languageSettings',
  function (keyCapture, languageSettings) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('keydown', function (event) {
          var lang = languageSettings.getFor('treebank').lang;
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
