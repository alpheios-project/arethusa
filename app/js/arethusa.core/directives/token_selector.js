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
        scope.hasNoTokensSelected = true;
        scope.hasSomeTokensSelected = false;
        scope.hasAllTokensSelected = false;

        scope.countOfSelectedTokens = function() {
          return state.hasClickSelections();
        };

        scope.$watch('countOfSelectedTokens()', function(newValue, oldValue) {
            scope.hasNoTokensSelected = newValue === 0;
            scope.hasSomeTokensSelected = newValue > 0 && newValue !== state.totalTokens;
            scope.hasAllTokensSelected = newValue === state.totalTokens;
        });

        scope.changeSelection = function() {
          if (scope.hasNoTokensSelected) {
            state.multiSelect(Object.keys(scope.tokens));
          } else {
            state.deselectAll();
          }
        };
      },
      templateUrl: 'templates/arethusa.core/token_selector.html'
    };
  }
]);

