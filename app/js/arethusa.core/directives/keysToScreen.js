"use strict";

angular.module('arethusa.core').directive('keysToScreen', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.keys = [];

        function Key(key) {
          this.str = key === "PLUS" ? '+' : key;
          this.joiner = key === 'PLUS';
        }

        function parseKey(key) {
          var keys, elements;
          keys = (key + '').split('-'); // key can also be a number
          // This looks a bit ugly, but a regular + might also be a
          // valid keybinding - we therefore use an unambigous value here.
          keys = keys.join('-PLUS-').split('-');
          elements = arethusaUtil.inject([], keys, function(memo, key) {
            if (key.match(/^[A-Z]$/)) {
              arethusaUtil.pushAll(memo, ['shift', 'PLUS', key.toLowerCase()]);
            } else {
              memo.push(key);
            }
          });
          return arethusaUtil.map(elements, function(el) { return new Key(el); });
        }

        var clear, override, readyToOverride;
        scope.$on('keyCaptureLaunched', function(event, key) {
          var keys = parseKey(key);
          scope.$apply(function() {
            if (readyToOverride) {
              scope.keys = keys;
              readyToOverride = false;
            } else {
              arethusaUtil.pushAll(scope.keys, keys);
            }
          });

          if (override) $timeout.cancel(override);
          if (clear) $timeout.cancel(clear);

          override = $timeout(function() {
            readyToOverride = true;
          }, 1500);

          clear = $timeout(function() {
            scope.keys = [];
          }, 3200);
        });
      },
      templateUrl: 'templates/arethusa.core/keys_to_screen.html'
    };
  }
]);
