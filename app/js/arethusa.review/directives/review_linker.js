"use strict";

angular.module('arethusa.review').directive('reviewLinker', [
  'review',
  'translator',
  function(review, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.review = review;

        scope.translations = translator({
          'review.link' : 'link',
          'review.unlink' : 'unlink'
        });

        function setTitle(prop) {
          element.attr('title', scope.translations[scope.icon]());
        }

        scope.$watch('translations', function(newVal, oldVal) {
          if (newVal !== oldVal) setTitle();
        }, true);

        scope.$watch('review.link', function(newVal, oldVal) {
          if (newVal) {
            scope.icon = 'unlink';
            if (newVal !== oldVal) {
              review.goToCurrentChunk();
            }
          } else {
            scope.icon = 'link';
          }
          setTitle();
        });
      },
      templateUrl: 'templates/arethusa.review/review_linker.html'
    };
  }
]);
