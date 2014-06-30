"use strict";

angular.module('arethusa.depTree').directive('unusedTokenHighlighter', [
  'state',
  function(state) {
    return {
      restrict: 'A',
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
        }

        scope.$watch('s.tokens', function(newVal, oldVal) {
          init();
        });
      }
    };
  }
]);
