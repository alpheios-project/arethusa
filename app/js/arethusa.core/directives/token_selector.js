"use strict";

angular.module('arethusa.core').directive('tokenSelector', [
  'state', '_',
  function(state, _) {
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

          scope.updateSelect();
        });

        scope.updateSelect = function() {
          if (scope.hasAllTokensSelected) {
            scope.selector = scope.selectors[0];
          } else if (scope.hasNoTokensSelected) {
            scope.selector = scope.selectors[1];
          }
        };

        scope.selectAll = function() {
          state.multiSelect(Object.keys(scope.tokens));
        };

        scope.selectUnused = function() {
          var unused = scope.tokensWithoutHead();
          state.multiSelect(_.map(unused, function(token) { return token.id; }));
        };

        scope.changeSelection = function() {
          if (scope.hasNoTokensSelected) {
            scope.selectAll();
          } else {
            state.deselectAll();
          }
        };

        scope.tokensWithoutHead = function() {
          return _.filter(scope.tokens, function(token) {
            return !token.head.id;
          });
        };


        scope.selectors = [
          {
          id: 0,
          label: function() {
            return "All";
          },
          action: function() {
            scope.resetActive();
            scope.selectAll();
          },
          isActive: function() { return scope.hasAllTokensSelected; }
        },
        {id: 1, label: function() { return "None"; }, action: state.deselectAll, isActive: function() { return scope.hasNoTokensSelected; }},
        {id: 2, label: function() { return scope.tokensWithoutHead().length + " unused"; },
          action: scope.selectUnused, isActive: function(){ return false;}}
        ];

        scope.resetActive = function() {
          angular.forEach(scope.selectors, function(selector) {
            selector.isActive = false;
          });
        };
      },
      templateUrl: 'templates/arethusa.core/token_selector.html'
    };
  }
]);

