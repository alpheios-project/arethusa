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

        var conf = keyCapture.conf('sidepanel');
        var defaults = {
          nextTab: ['j', moveToNext],
          prevTab: ['k', moveToPrev],
          toggle:  ['s', sidepanel.toggle]
        };

        var captures = arethusaUtil.inject({}, defaults, function(memo, keyName, keyAndFn) {
          var key = conf[keyName] || keyAndFn[0];
          memo[key] = keyAndFn[1];
        });

        keyCapture.registerCaptures(captures, scope);
      }
    };
  }
]);
