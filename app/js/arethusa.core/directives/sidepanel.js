"use strict";

angular.module('arethusa.core').directive('sidepanel', [
  'sidepanel',
  'keyCapture',
  'plugins',
  function(sidepanel, keyCapture, plugins) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var minIndex = 0;

        function currentIndex() {
          return plugins.sub.indexOf(plugins.active);
        }

        function maxIndex() {
          return plugins.sub.length - 1;
        }

        function selectPluginByIndex(index) {
          var plugin = plugins.sub[index];
          plugins.setActive(plugin);
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
              kC.create('nextTab', function() { kC.doRepeated(moveToNext); }, 'W'),
              kC.create('prevTab', function() { kC.doRepeated(moveToPrev); }, 'E'),
              kC.create('toggle',  function() { sidepanel.toggle(); }, 'q'),
            ]
          };
        });
        angular.extend(sidepanel.activeKeys, keys.sidepanel);
      }
    };
  }
]);
