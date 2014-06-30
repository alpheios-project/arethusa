"use strict";

angular.module('arethusa.depTree').directive('unusedTokenHighlighter', [
  'state',
  function(state) {
    return {
      restrict: 'A',
      scope: {
        highlightMode: '=unusedTokenHighlighter'
      },
      link: function(scope, element, attrs) {
        scope.s = state;
        function tokensWithoutHeadCount() {
          return state.countTokens(function (token) {
            return hasNoHead(token);
          });
        }

        function hasNoHead(token) {
          return !(token.head || {}).id;
        }

        function init() {
          scope.total = state.totalTokens;
          scope.unusedCount = tokensWithoutHeadCount();
          if (scope.highlightMode) applyHighlighting();
        }


        function applyHighlighting() {
        }

        function unapplyHighlighting() {
        }

        element.bind('click', function() {
          if (scope.highlightMode) {
            unapplyHighlighting();
          } else {
            applyHighlighting();
          }
          scope.highlightMode = !scope.highlightMode;
        });

        scope.$watch('s.tokens', function(newVal, oldVal) {
          init();
        });
      }
    };
  }
]);
