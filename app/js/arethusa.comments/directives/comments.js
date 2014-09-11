"use strict";

// This directive is temporarily renamed to commentsX because of
// https://github.com/latin-language-toolkit/arethusa/issues/384

angular.module('arethusa.comments').directive('commentsX', [
  'comments',
  'state',
  function(comments, state) {
    return {
      restrict: 'A',
      scope: {
        comments: "=commentsX",
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
            scope.select = function() {
              state.multiSelect(scope.comments.ids);
            };
          }
        };
      },
      templateUrl: 'templates/arethusa.comments/comments.directive.html'
    };
  }
]);
