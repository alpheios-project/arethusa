"use strict";

angular.module('arethusa.core').directive('sidepanel', [
  'keyCapture',
  function(keyCapture) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var minIndex = 0;

        function currentIndex() {
          return scope.subPlugins.indexOf(scope.activePlugin);
        }

        function maxIndex() {
          return scope.subPlugins.length;
        }

        function moveToNext() {
          var nextPlugin = scope.subPlugins[currentIndex() + 1];
          scope.declareActive(nextPlugin);
        }

        keyCapture.onKeyPressed(keyCapture.keyCodes.j, function() {
          console.log('keyPressed');
          scope.$apply(moveToNext);
        });

      }
    };
  }
]);
