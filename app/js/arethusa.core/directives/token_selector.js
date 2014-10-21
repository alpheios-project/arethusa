"use strict";

angular.module('arethusa.core').directive('tokenSelector', [
  'state',
  function(state) {
    return {
      restrict: 'A',
      scope: {
        tokens: "=tokenSelector"
      },
      link: function(scope, element, attrs) {
        scope.changeSelection = function() {
          if (scope.hasNoSelectedTokens()) {
            state.multiSelect(Object.keys(scope.tokens));
          } else {
            state.deselectAll();
          }
        };

        scope.hasNoSelectedTokens = function() {
          return !state.hasClickSelections();
        };

        scope.hasSomeTokensSelected = function() {
          var selected = state.hasClickSelections();
          return selected > 0 && selected !== state.totalTokens;
        };

        scope.hasAllTokensSelected = function() {
          return state.hasClickSelections() === state.totalTokens;
        };
      },
      templateUrl: 'templates/arethusa.core/token_selector.html'
    };
  }
]);

