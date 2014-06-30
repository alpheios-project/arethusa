"use strict";

angular.module('arethusa.depTree').directive('unusedTokenHighlighter', [
  'state',
  function(state) {
    return {
      restrict: 'A',
      scope: {
        highlightMode: '@unusedTokenHighlighter',
        style: '@unusedTokenStyle'
      },
      link: function(scope, element, attrs) {
        var unusedTokens;
        var headWatches = [];
        scope.s = state;
        scope.style = scope.style || "font-style: italics";

        function tokensWithoutHeadCount() {
          return state.countTokens(function (token) {
            return hasNoHead(token);
          });
        }

        function hasNoHead(token) {
          return !(token.head || {}).id;
        }

        function findUnusedTokens() {
          angular.forEach(state.tokens, function(token, id) {
            if (hasNoHead(token)) {
              scope.unusedCount++;
              unusedTokens[id] = true;
            }
          });
        }

        function initHeadWatches() {
          destroyOldHeadWatches();
          angular.forEach(state.tokens, function(token, id) {
            var childScope = scope.$new();
            childScope.head = token.head;
            childScope.$watch('head.id', function(newVal, oldVal) {
              if (newVal !== oldVal) {
                if (newVal) {
                  scope.unusedCount--;
                  unusedTokens[id] = true;
                } else {
                  scope.unusedCount++;
                  delete unusedTokens[id];
                }
              }
            });
            headWatches.push(childScope);
          });
        }

        function destroyOldHeadWatches() {
          angular.forEach(headWatches, function(childScope, i) {
            childScope.$destroy();
          });
          headWatches = [];
        }


        function init() {
          scope.total = state.totalTokens;
          scope.unusedCount = 0;
          unusedTokens = {};
          findUnusedTokens();
          initHeadWatches();
        }

        function applyHighlighting() {
          console.log('a');
        }

        function unapplyHighlighting() {
          console.log('b');
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
      },
      template: '{{ unusedCount }} of {{ total }} unused'
    };
  }
]);
