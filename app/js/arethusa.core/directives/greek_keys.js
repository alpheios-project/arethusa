'use strict';
angular.module('arethusa.core').directive('greekKeys',[
  'keyCapture',
  function (keyCapture) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('keydown', function (event) {
          var input = event.target.value;
          var gr = keyCapture.getGreekKey(event);
          if (gr === undefined) {
            return true;
          } else {
            event.target.value = input + gr;
            return false;
          }
        });
      }
    };
  }
]);
