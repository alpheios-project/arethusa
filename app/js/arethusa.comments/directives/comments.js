"use strict";

angular.module('arethusa.comments').directive('comments', [
  'comments',
  'idHandler',
  'state',
  function(comments, idHandler, state) {
    return {
      restrict: 'A',
      scope: {
        comments: "=",
        id: '=commentTarget'
      },
      compile: function(tElement, tAttrs, transclude) {
        return {
          pre: function(scope, iElement, iAttrs) {
            // Need to define the token in a pre-compile function,
            // otherwise the directive in the template cannot render!
            scope.token = state.getToken(scope.id);

            // Could also be in a post function of course
            scope.formatId = function(id) {
              return idHandler.formatId(id, '%w');
            };
          },
        };
      },
      templateUrl: 'templates/arethusa.comments/comments.directive.html'
    };
  }
]);
