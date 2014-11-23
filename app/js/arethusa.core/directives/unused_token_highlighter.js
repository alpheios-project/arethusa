"use strict";

angular.module('arethusa.core').directive('unusedTokenHighlighter', [
  'state',
  '$parse',
  '$window',
  'translator',
  'StateChangeWatcher',
  function(state, $parse, $window, translator, StateChangeWatcher) {
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

        var getter = $parse(scope.uthCheckProperty);

        var callbacks = {
          newMatch: function(token) {
            if (highlightMode) state.addStyle(token.id, style);
          },
          lostMatch: function(token) {
            if (highlightMode) removeStyle(token.id);
          },
          changedCount: function(newCount) {
            scope.unusedCount = newCount;
          }
        };
        var stateChangeWatcher = new StateChangeWatcher(
          scope.uthCheckProperty, getter, callbacks);
        stateChangeWatcher.initCount();

        if (highlightMode) applyHighlighting();

        function applyHighlighting() {
          stateChangeWatcher.applyToMatching(function(id) {
            state.addStyle(id, style);
          });
        }

        function removeStyle(id) {
          var styles = Object.keys(style);
          state.removeStyle(id, styles);
        }

        function unapplyHighlighting() {
          stateChangeWatcher.applyToMatching(function(id) {
            removeStyle(id);
          });
        }

        function selectUnusedTokens() {
          unapplyHighlighting();
          state.multiSelect(Object.keys(stateChangeWatcher.matchingTokens));
        }

        element.bind('click', function() {
          scope.$apply(function() {
            if (highlightMode) {
              unapplyHighlighting();
            } else {
              applyHighlighting();
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
          stateChangeWatcher.initCount();
        });

        scope.$on('tokenAdded', function(event, token) {
          scope.total++;
          stateChangeWatcher.initCount();
          if (highlightMode) applyHighlighting();
        });

        scope.$on('tokenRemoved', function(event, token) {
          scope.total--;
        });

        scope.tooltip = {};
        translator('uth.tooltip', scope.tooltip, 'text');
      },
      template: '\
      <span\
      tooltip-html-unsafe="{{ tooltip.text }}"\
      tooltip-popup-delay="700"\
      tooltip-placement="left"\
      translate="uth.count"\
      translate-value-count="{{ unusedCount }}"\
      translate-value-total="{{ total }}">\
      '
    };
  }
]);
