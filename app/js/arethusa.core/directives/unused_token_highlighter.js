"use strict";

angular.module('arethusa.core').directive('unusedTokenHighlighter', [
  'state',
  '$window',
  'translator',
  'StateChangeWatcher',
  'Highlighter',
  function(state, $window, translator, StateChangeWatcher, Highlighter) {
    return {
      restrict: 'A',
      scope: {
        highlightMode: '@unusedTokenHighlighter',
        style: '=unusedTokenStyle',
        uthCheckProperty: '@'
      },
      link: function(scope, element, attrs) {
        var style = scope.style || { "background-color": "rgb(255, 216, 216)" }; // a very light red
        var highlightMode = !!scope.highlightMode;
        scope.s = state;
        scope.total = state.totalTokens;

        var callbacks = {
          newMatch: function(token) {
            if (highlightMode) state.addStyle(token.id, style);
          },
          lostMatch: function(token) {
            if (highlightMode) highlighter.removeStyle(token.id);
          },
          changedCount: function(newCount) {
            scope.unusedCount = newCount;
          }
        };
        var stateChangeWatcher = new StateChangeWatcher(
          scope.uthCheckProperty, callbacks);
        stateChangeWatcher.initCount();

        var highlighter = new Highlighter(stateChangeWatcher, style);

        if (highlightMode) highlighter.applyHighlighting();

        function selectUnusedTokens() {
          highlighter.unapplyHighlighting();
          state.multiSelect(Object.keys(stateChangeWatcher.matchingTokens));
        }

        element.bind('click', function() {
          scope.$apply(function() {
            if (highlightMode) {
              highlighter.unapplyHighlighting();
            } else {
              highlighter.applyHighlighting();
            }
          });
          highlightMode = !highlightMode;
        });

        element.bind('dblclick', function(event) {
          scope.$apply(function() {
            selectUnusedTokens();
          });

          // Trying to prevent the native browser behaviour
          // for dblclicks - they are pretty browser-dependent
          event.preventDefault();
          $window.getSelection().empty();
          return false;
        });

        scope.$watch('s.tokens', function(newVal, oldVal) {
          scope.total = state.totalTokens;
          stateChangeWatcher.initCount();
        });

        scope.$on('tokenAdded', function(event, token) {
          scope.total++;
          stateChangeWatcher.initCount();
          if (highlightMode) highlighter.applyHighlighting();
        });

        scope.$on('tokenRemoved', function(event, token) {
          scope.total--;
        });

        translator('uth.tooltip', function(trsl) {
          scope.tooltip = trsl();
        });
      },
      template: '\
      <span\
      tooltip-html-unsafe="{{ tooltip }}"\
      tooltip-popup-delay="700"\
      tooltip-placement="left"\
      translate="uth.count"\
      translate-value-count="{{ unusedCount }}"\
      translate-value-total="{{ total }}">\
      '
    };
  }
]);
