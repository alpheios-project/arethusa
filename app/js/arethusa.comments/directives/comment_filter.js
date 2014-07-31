"use strict";

angular.module('arethusa.comments').directive('commentFilter', [
  'comments',
  'state',
  function(comments) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.$watch('filterSelected', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            if (newVal) {
              comments.filter.selection = true;
            } else {
              delete comments.filter.selection;
            }
          }
        });
      },
      templateUrl: 'templates/arethusa.comments/comment_filter.html'
    };
  }
]);
