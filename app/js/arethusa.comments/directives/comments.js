"use strict";

angular.module('arethusa.comments').directive('comments', [
  'comments',
  'state',
  function(comments, state) {
    return {
      restrict: 'A',
      scope: {
        comments: "=",
      },
      compile: function(tElement, tAttrs, transclude) {
        return {
          pre: function(scope, iElement, iAttrs) {
            // Need to define the token in a pre-compile function,
            // otherwise the directive in the template cannot render!
            scope.tokens = arethusaUtil.map(scope.comments.ids, function(id) {
              return state.getToken(id);
            });
          },
          post: function(scope, iElement, iAttrs) {
            scope.submit = function() {
              comments.createNewComment(scope.comments.ids, scope.comment);
            };
          }
        };
      },
      templateUrl: 'templates/arethusa.comments/comments.directive.html'
    };
  }
]);
