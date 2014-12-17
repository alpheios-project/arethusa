"use strict";

angular.module('arethusa.comments').directive('commentFilter', [
  'comments',
  'state',
  'translator',
  function(comments, state, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var style = { "background-color": "rgb(142, 255, 142)" };
        scope.comments = comments;
        scope.total = state.totalTokens;
        scope.filter = comments.filter;

        var highlightOn;
        var watcher;

        function addHighlighting() {
          angular.forEach(scope.ids, function(id, i) {
            state.addStyle(id, style);
          });
        }

        function removeHighlighting() {
          angular.forEach(scope.ids, function(id, i) {
            var styles = Object.keys(style);
            state.removeStyle(id, styles);
          });
        }

        scope.highlightCommented = function() {
          if (highlightOn) {
            removeHighlighting();
          } else {
            addHighlighting();
          }
          highlightOn = !highlightOn;
        };

        scope.selectCommented = function() {
          removeHighlighting();
          state.multiSelect(scope.ids);
        };

        scope.$watchCollection('comments.reverseIndex', function(newVal, oldVal) {
          scope.ids = Object.keys(newVal);
          scope.count = scope.ids.length;
        });

        translator('uth.tooltip', function(trsl) {
          scope.tooltip = trsl();
        });
      },
      templateUrl: 'templates/arethusa.comments/comment_filter.html'
    };
  }
]);
