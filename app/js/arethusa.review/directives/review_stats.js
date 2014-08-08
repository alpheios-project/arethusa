"use strict";

angular.module('arethusa.review').directive('reviewStats', [
  'review',
  'state',
  function(review, state) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.rev = review;
        scope.$watch('rev.diffActive', function(newVal) {
          if (newVal) {
            scope.tokens = review.diffCounts.tokens;
            scope.attrs  = review.diffCounts.attrs;
            var percentage = arethusaUtil.toPercent(state.totalTokens, scope.tokens);
            scope.rgbCode = arethusaUtil.percentToRgb(percentage, 0.3);
          }
        });
      },
      templateUrl: 'templates/arethusa.review/review_stats.html'
    };
  }
]);
