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
          return scope.subPlugins.length - 1;
        }

        function selectPluginByIndex(index) {
          var plugin = scope.subPlugins[index];
          scope.declareActive(plugin);
        }

        function moveToNext() {
          var current = currentIndex();
          var index = current === maxIndex() ? minIndex : current + 1;
          selectPluginByIndex(index);
        }

        function moveToPrev() {
          var current = currentIndex();
          var index = current === minIndex ? maxIndex() : current - 1;
          selectPluginByIndex(index);
        }

        keyCapture.onKeyPressed(keyCapture.keyCodes.j, function() {
          scope.$apply(moveToNext);
        });

        keyCapture.onKeyPressed(keyCapture.keyCodes.k, function() {
          scope.$apply(moveToPrev);
        });
      }
    };
  }
]);
