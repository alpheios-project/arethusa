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
        var hasNoTokensSelected = true;
        var hasAllTokensSelected = false;

        scope.countOfSelectedTokens = function() {
          return state.hasClickSelections();
        };

        scope.$watch('countOfSelectedTokens()', function(newValue, oldValue) {
          hasNoTokensSelected = newValue === 0;
          hasAllTokensSelected = newValue === state.totalTokens;

          updateSelectors();
        });

        var selectAll = function() {
          state.multiSelect(Object.keys(scope.tokens));
        };

        var tokensWithoutHead = function() {
          return _.filter(scope.tokens, function(token) {
            return !token.head.id;
          });
        };

        var selectUnused = function() {
          var unused = tokensWithoutHead();
          state.multiSelect(_.map(unused, function(token) { return token.id; }));
        };

        var highlightStyle = { "background-color": "rgb(255, 216, 216)" };
        var highlightUnused = function() {
          unusedHighlighter.isActive = !unusedHighlighter.isActive;
          var unused = tokensWithoutHead();
          if (unusedHighlighter.isActive) {
            angular.forEach(unused, function(token) {
              state.addStyle(token.id, highlightStyle);
            });
          } else {
            var styles = Object.keys(highlightStyle);
            angular.forEach(unused, function(token) {
              state.removeStyle(token.id, styles);
            });
          }
        };

        var noneSelector = {
          label: function() { return "None"; },
          action: state.deselectAll,
          isActive: true
        };

        var allSelector = {
          label: function() { return "All"; },
          action: selectAll,
          isActive: false
        };

        var unusedSelector = {
          label: function() { return tokensWithoutHead().length + " unused"; },
          action: selectUnused,
          isActive: false
        };

        var unusedHighlighter = {
          label: function() { return "highlight unused"; },
          action: highlightUnused,
          styleClasses: 'unused-highlighter',
          isActive: false
        };

        scope.selectors = [
          noneSelector,
          allSelector,
          unusedSelector,
          unusedHighlighter
        ];

        var areAllSelected = function(tokens) {
          return _.all(tokens, function(token) {
            return state.isClicked(token.id);
          });
        };

        var updateSelectors = function() {
          noneSelector.isActive = hasNoTokensSelected;
          allSelector.isActive = hasAllTokensSelected;

          var unusedTokens = tokensWithoutHead();
          unusedSelector.isActive = !hasNoTokensSelected &&
            scope.countOfSelectedTokens() === unusedTokens.length &&
            areAllSelected(unusedTokens);
        };
      },
      templateUrl: 'templates/arethusa.core/token_selector.html'
    };
  }
]);

