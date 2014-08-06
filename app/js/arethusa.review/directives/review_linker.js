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

        scope.translations = {};
        translator('review.link',   scope.translations, 'link');
        translator('review.unlink', scope.translations, 'unlink');

        function setTitle(prop) {
          element.attr('title', scope.translations[scope.icon]);
        }

        scope.$watch('translations', function(newVal, oldVal) {
          if (newVal !== oldVal) setTitle();
        });

        scope.$watch('review.link', function(newVal, oldVal) {
          if (newVal) {
            scope.icon = 'unlink';
            review.goToCurrentChunk();
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
