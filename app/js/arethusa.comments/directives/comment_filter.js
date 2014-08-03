"use strict";

angular.module('arethusa.comments').directive('commentFilter', [
  'comments',
  'state',
  function(comments) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.filter = comments.filter;
      },
      templateUrl: 'templates/arethusa.comments/comment_filter.html'
    };
  }
]);
