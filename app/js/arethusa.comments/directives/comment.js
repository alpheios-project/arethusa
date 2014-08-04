"use strict";

angular.module('arethusa.comments').directive('comment', [
  'comments',
  function(comments) {
    return {
      restrict: 'A',
      scope: {
        comment: '='
      },
      link: function(scope, element, attrs) {
      },
      templateUrl: 'templates/arethusa.comments/comment.html'
    };
  }
]);
