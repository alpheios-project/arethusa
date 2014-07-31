"use strict";

angular.module('arethusa.comments').directive('comments', [
  'comments',
  function(comments) {
    return {
      restrict: 'A',
      scope: {
        comments: "=",
        commentTarget: '='
      },
      link: function(scope, element, attrs) {
        // Process the id to something readable here
      },
      templateUrl: 'templates/arethusa.comments/comments.directive.html'
    };
  }
]);
