"use strict";

angular.module('arethusa.core').directive('sidepanel', [
  'sidepanel',
  'keyCapture',
  function(sidepanel, keyCapture) {
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

        var keys = keyCapture.initCaptures(function(kC) {
          return {
            sidepanel: [
              kC.create('nextTab', function() { moveToNext(); }),
              kC.create('prevTab', function() { moveToPrev(); }),
              kC.create('toggle',  function() { sidepanel.toggle(); }, 's'),
            ]
          };
        });
        angular.extend(sidepanel.activeKeys, keys.sidepanel);
      }
    };
  }
]);
