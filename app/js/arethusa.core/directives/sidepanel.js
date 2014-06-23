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

        var conf = keyCapture.conf().sidepanel || {};
        var nextKey = conf.nextTab || 'j';
        var prevKey = conf.prevTab || 'k';
        var toggle  = conf.toggle  || 's';
        var captures = {};
        captures[nextKey] = moveToNext;
        captures[prevKey] = moveToPrev;
        captures[toggle]  = sidepanel.toggle;

        keyCapture.registerCaptures(captures, scope);
      }
    };
  }
]);
