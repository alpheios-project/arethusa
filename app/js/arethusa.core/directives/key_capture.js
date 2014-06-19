'use strict';
angular.module('arethusa.core').directive('keyCapture', [
  'keyCapture',
  function (keyCapture) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var doc = angular.element(document.body);

        doc.on('keydown', function (event) {
          keyCapture.keydown(event);
        });
        doc.on('keyup', function (event) {
          keyCapture.keyup(event);
        });
      }
    };
  }
]);
