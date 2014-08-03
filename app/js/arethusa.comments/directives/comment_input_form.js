"use strict";

angular.module('arethusa.comments').directive('commentInputForm', [
  'comments',
  function(comments) {
    return {
      restrict: 'A',
      scope: {
        active: "=commentInputForm",
        target: "="
      },
      link: function(scope, element, attrs) {
        scope.submit = function() {
          comments.createNewComment(scope.target, scope.comment, function() {
            scope.comment = '';
          });
        };
      },
      templateUrl: 'templates/arethusa.comments/comment_input_form.html'
    };
  }
]);
