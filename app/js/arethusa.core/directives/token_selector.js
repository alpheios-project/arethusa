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
        scope.state = state;

        scope.$watch('state.hasClickSelections()', function(newValue, oldValue) {
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
            translator("selector.unused", setLabel(unusedSelector));
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

        function setLabel(obj) {
          return function(translationFn) {
              obj.label = translationFn(obj);
          };
        }

        function setTooltip(obj) {
          return function(translationFn) {
              obj.tooltip = translationFn(obj);
          };
        }

        function translateSelector(selector, name) {
          var translationId = "selector." + name;
          translator(translationId, setLabel(selector));
          translator(translationId + "Tooltip", setTooltip(selector));
        }

        scope.selection = {};
        translateSelector(scope.selection, "selection");

        var noneSelector = {
          action: function() {
            state.deselectAll();
            highlighter.applyHighlighting();
          },
          isActive: true
        };
        translateSelector(noneSelector, "none");

        var allSelector = {
          action: selectAll,
          isActive: false
        };
        translateSelector(allSelector, "all");

        var unusedSelector = {
          action: selectUnused,
          isActive: false,
          count: 0
        };
        translateSelector(unusedSelector, "unused");

        var unusedHighlighter = {
          action: switchHighlighting,
          styleClasses: 'unused-highlighter',
          isActive: false
        };
        translateSelector(unusedHighlighter, "highlightUnused");

        scope.selectors = [
          noneSelector,
          // allSelector, // not used right now for performance reasons
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
            state.hasClickSelections() === unusedWatcher.count &&
            areAllSelected(unusedWatcher.matchingTokens);
        };

        scope.$watch('state.tokens', function(newVal, oldVal) {
          unusedWatcher.initCount();
        });
      },
      templateUrl: 'templates/arethusa.core/token_selector.html'
    };
  }
]);

