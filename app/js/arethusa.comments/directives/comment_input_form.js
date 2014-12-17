"use strict";

angular.module('arethusa.comments').directive('commentInputForm', [
  'comments',
  'translator',
  function(comments, translator) {
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

        function markdownPlaceholder(translation) {
          scope.markdownPlaceholder = translation();
        }

        translator('markdownEnabled', markdownPlaceholder);
      },
      templateUrl: 'templates/arethusa.comments/comment_input_form.html'
    };
  }
]);
