"use strict";

angular.module('arethusa.core').directive('unusedTokenHighlighter', [
  'state',
  '$parse',
  '$window',
  'translator',
  function(state, $parse, $window, translator) {
    return {
      restrict: 'A',
      scope: {
        highlightMode: '@unusedTokenHighlighter',
        style: '=unusedTokenStyle',
        uthCheckProperty: '@'
      },
      link: function(scope, element, attrs) {
        var unusedTokens;
        var style = scope.style || { "background-color": "rgb(255, 216, 216)" }; // a very light red
        var highlightMode = !!scope.highlightMode;
        scope.s = state;

        var getter = $parse(scope.uthCheckProperty);

        function checkIfUnused(token, id) {
          if (!getter(token)) {
            scope.unusedCount++;
            unusedTokens[id] = true;
          }
        }

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
        }

        state.watch(scope.uthCheckProperty, watchChange);

        function init() {
          scope.total = state.totalTokens;
          scope.unusedCount = 0;
          unusedTokens = {};
          findUnusedTokens();
          if (highlightMode) applyHighlighting();
        }

        function applyHighlighting() {
          angular.forEach(unusedTokens, function(val, id) {
            state.addStyle(id, style);
          });
        }

        function removeStyle(id) {
          var styles = Object.keys(style);
          state.removeStyle(id, styles);
        }

        function unapplyHighlighting() {
          angular.forEach(unusedTokens, function(val, id) {
            removeStyle(id);
          });
        }

        function selectUnusedTokens() {
          unapplyHighlighting();
          state.multiSelect(Object.keys(unusedTokens));
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
          init();
        });

        scope.$on('tokenAdded', function(event, token) {
          var id = token.id;
          scope.total++;
          checkIfUnused(token, id);
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
