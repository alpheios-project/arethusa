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
      templateUrl: 'js/arethusa.comments/templates/comment.html'
    };
  }
]);
