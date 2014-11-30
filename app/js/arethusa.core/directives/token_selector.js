"use strict";

angular.module('arethusa.core').directive('tokenSelector', [
  'state', '_', 'StateChangeWatcher', '$parse', 'Highlighter',
  function(state, _, StateChangeWatcher, $parse, Highlighter) {
    return {
      restrict: 'A',
      scope: {
        tokens: "=tokenSelector"
      },
      link: function(scope, element, attrs) {
        var hasNoTokensSelected = true;
        var hasAllTokensSelected = false;
        var style = scope.style || { "background-color": "rgb(255, 216, 216)" }; // a very light red

        scope.countOfSelectedTokens = function() {
          return state.hasClickSelections();
        };

        scope.$watch('countOfSelectedTokens()', function(newValue, oldValue) {
          hasNoTokensSelected = newValue === 0;
          hasAllTokensSelected = newValue === state.totalTokens;

          updateSelectors();
        });

        var callbacks = {
          newMatch: function(token) {
            if (unusedHighlighter.isActive) state.addStyle(token.id, style);
          },
          lostMatch: function(token) {
            if (unusedHighlighter.isActive) highlighter.removeStyle(token.id);
          },
          changedCount: function(newCount) {
            unusedSelector.label = newCount + " unused";
          }
        };
        var property = 'head.id';
        var getter = $parse(property);
        var unusedWatcher = new StateChangeWatcher(
          property, getter, callbacks);

        var highlighter = new Highlighter(unusedWatcher, style);

        var selectAll = function() {
          state.multiSelect(Object.keys(scope.tokens));
        };

        var selectUnused = function() {
          highlighter.unapplyHighlighting();
          state.multiSelect(Object.keys(unusedWatcher.matchingTokens));
        };


        function switchHighlighting() {
          if (unusedHighlighter.isActive) {
            highlighter.unapplyHighlighting();
          } else {
            highlighter.applyHighlighting();
          }
          unusedHighlighter.isActive = !unusedHighlighter.isActive;
        }

        var noneSelector = {
          label: "none",
          action: function() {
            state.deselectAll();
            highlighter.applyHighlighting();
          },
          isActive: true
        };

        var allSelector = {
          label: "all",
          action: selectAll,
          isActive: false
        };

        var unusedSelector = {
          label: "0 unused",
          action: selectUnused,
          isActive: false
        };

        var unusedHighlighter = {
          label: "highlight unused",
          action: switchHighlighting,
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
          return _.all(Object.keys(tokens), function(tokenId) {
            return state.isClicked(tokenId);
          });
        };

        var updateSelectors = function() {
          noneSelector.isActive = hasNoTokensSelected;
          allSelector.isActive = hasAllTokensSelected;

          unusedSelector.isActive = !hasNoTokensSelected &&
            scope.countOfSelectedTokens() === unusedWatcher.count &&
            areAllSelected(unusedWatcher.matchingTokens);
        };

        unusedWatcher.initCount();
      },
      templateUrl: 'templates/arethusa.core/token_selector.html'
    };
  }
]);

