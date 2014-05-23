"use strict";

angular.module('arethusa.core').directive('keyCapture', ['keyCapture', function(keyCapture) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs, controller) {
      element.on('keydown', function(event){
        keyCapture.keydown(event);
      });

      element.on('keyup', function(event) {
        keyCapture.keyup(event);
      });
    }
  };
}]);
