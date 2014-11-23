"use strict";

angular.module('arethusa.core').directive('unusedTokenHighlighter', [
  'state',
  '$parse',
  '$window',
  'translator',
  'StateChangeWatcher',
  function(state, $parse, $window, translator, StateChangeWatcher) {
    return {
      restrict: 'A',
      scope: {
        highlightMode: '@unusedTokenHighlighter',
        style: '=unusedTokenStyle',
        uthCheckProperty: '@'
      },
      link: function(scope, element, attrs) {
        // var unusedTokens;
        var style = scope.style || { "background-color": "rgb(255, 216, 216)" }; // a very light red
        var highlightMode = !!scope.highlightMode;
        scope.s = state;
        scope.total = state.totalTokens;

        var getter = $parse(scope.uthCheckProperty);

        /*
        function checkIfUnused(token, id) {
          if (!getter(token)) {
            scope.unusedCount++;
            unusedTokens[id] = true;
          }
        }
       */

        var callbacks = {
          newMatch: function(token) {
            if (highlightMode) state.addStyle(token.id, style);
          },
          lostMatch: function(token) {
            if (highlightMode) removeStyle(token.id);
          },
          changedCount: function(newCount) {
            scope.unusedCount = newCount;
          }
        };
        var stateChangeWatcher = new StateChangeWatcher(
          scope.uthCheckProperty, getter, callbacks);
        stateChangeWatcher.initCount();

        /*
        function findUnusedTokens() {
          angular.forEach(state.tokens, checkIfUnused);
        }

        function watchChange(newVal, oldVal, event) {
          var id = event.token.id;
          if (newVal) {
            // Check if the token was used before!
            if (!oldVal) {
              scope.unusedCount--;
              delete unusedTokens[id];
              if (highlightMode) removeStyle(id);
            }
          } else {
            scope.unusedCount++;
            unusedTokens[id] = true;
            if (highlightMode) state.addStyle(id, style);
          }

          console.log('Old: ' + scope.unusedCount + ' New: ' + stateChangeWatcher.count);
        }
       */

        // state.watch(scope.uthCheckProperty, watchChange);

        /*
        function init() {
          scope.total = state.totalTokens;
          scope.unusedCount = 0;
          unusedTokens = {};
          findUnusedTokens();
          if (highlightMode) applyHighlighting();
        }
       */

        if (highlightMode) applyHighlighting();

        function applyHighlighting() {
          stateChangeWatcher.applyToMatching(function(id) {
            state.addStyle(id, style);
          });

          /*
          angular.forEach(unusedTokens, function(val, id) {
            state.addStyle(id, style);
          });
         */
        }

        function removeStyle(id) {
          var styles = Object.keys(style);
          state.removeStyle(id, styles);
        }

        function unapplyHighlighting() {
          stateChangeWatcher.applyToMatching(function(id) {
            removeStyle(id);
          });
          /*
          angular.forEach(unusedTokens, function(val, id) {
            removeStyle(id);
          });
         */
        }

        function selectUnusedTokens() {
          unapplyHighlighting();
          // state.multiSelect(Object.keys(unusedTokens));
          state.multiSelect(Object.keys(stateChangeWatcher.matchingTokens));
        }

        element.bind('click', function() {
          scope.$apply(function() {
            if (highlightMode) {
              unapplyHighlighting();
            } else {
              applyHighlighting();
            }
          });
          highlightMode = !highlightMode;
        });

        element.bind('dblclick', function(event) {
          scope.$apply(function() {
            selectUnusedTokens();
          });

          // Trying to prevent the native browser behaviour
          // for dblclicks - they are pretty browser-dependent
          event.preventDefault();
          $window.getSelection().empty();
          return false;
        });

        scope.$watch('s.tokens', function(newVal, oldVal) {
          // init();
          stateChangeWatcher.initCount();
        });

        scope.$on('tokenAdded', function(event, token) {
          /*
          var id = token.id;
          scope.total++;
          checkIfUnused(token, id);
         */
          scope.total++;
          stateChangeWatcher.initCount();
          if (highlightMode) applyHighlighting();
        });

        scope.$on('tokenRemoved', function(event, token) {
          scope.total--;
        });

        scope.tooltip = {};
        translator('uth.tooltip', scope.tooltip, 'text');
      },
      template: '\
      <span\
      tooltip-html-unsafe="{{ tooltip.text }}"\
      tooltip-popup-delay="700"\
      tooltip-placement="left"\
      translate="uth.count"\
      translate-value-count="{{ unusedCount }}"\
      translate-value-total="{{ total }}">\
      '
    };
  }
]);
