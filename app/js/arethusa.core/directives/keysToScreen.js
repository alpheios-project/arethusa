"use strict";

angular.module('arethusa.core').directive('keysToScreen', [
  '$timeout',
  'configurator',
  'keyCapture',
  function($timeout, configurator, keyCapture) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var conf = configurator.configurationFor('main');

        function Key(key) {
          this.str = key === "PLUS" ? '+' : key;
          this.joiner = key === 'PLUS';
        }

        function parseKey(key) {
          // Producing new objects here in purpose, so that angular
          // has to redo the html element in the ngRepeat - we can
          // benefit from renewing the nice css animations then.
          //
          // We need || [] in case we encounter a numeric modifier.
          scope.actions = arethusaUtil.map(keyCapture.keyList[key] || [], function(el) {
            return { str: el };
          });

          var keys, elements;
          // This looks a bit ugly, but a regular + might also be a
          // valid keybinding - we therefore use an unambigous value here.
          //
          // Key can also be a number - we therefore typecast.
          keys = (key + '').replace(/-/g, '-PLUS-').split('-');
          elements = arethusaUtil.inject([], keys, function(memo, key) {
            if (key.match(/^[A-Z]$/)) {
              arethusaUtil.pushAll(memo, ['shift', 'PLUS', key.toLowerCase()]);
            } else {
              memo.push(key);
            }
          });
          return arethusaUtil.map(elements, function(el) { return new Key(el); });
        }

        // This isn't updated know - it's either activated on startup, or
        // it isn't.
        if (conf.showKeys) {
          scope.keys = [];
          scope.actions = [];

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
              scope.actions = [];
            }, 3200);
          });
        }

      },
      templateUrl: 'templates/arethusa.core/keys_to_screen.html'
    };
  }
]);
