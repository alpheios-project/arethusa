"use strict";

angular.module('arethusa.core').directive('tokenSelector', [
  'state', '_', 'StateChangeWatcher', 'Highlighter', 'translator',
  function(state, _, StateChangeWatcher, Highlighter, translator) {
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
            unusedSelector.count = newCount;
            translator("selector.unused", unusedSelector, "label");
          }
        };
        var unusedWatcher = new StateChangeWatcher('head.id', callbacks);

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
          action: function() {
            state.deselectAll();
            highlighter.applyHighlighting();
          },
          isActive: true
        };
        translator("selector.none", noneSelector, "label");

        var allSelector = {
          action: selectAll,
          isActive: false
        };
        translator("selector.all", allSelector, "label");

        var unusedSelector = {
          action: selectUnused,
          isActive: false,
          count: 0
        };
        translator("selector.unused", unusedSelector, "label");

        var unusedHighlighter = {
          action: switchHighlighting,
          styleClasses: 'unused-highlighter',
          isActive: false
        };
        translator("selector.highlightUnused", unusedHighlighter, "label");

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

