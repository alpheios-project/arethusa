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
            scope.tokens = arethusaUtil.map(scope.comments.ids, function(id) {
              return state.getToken(id);
            });
          },
          post: function(scope, iElement, iAttrs) {
            scope.formatId = function(id) {
              return idHandler.formatId(id, '%w');
            };

            function openInput(type) {
              scope.inputOpen = true;
              scope.commentType = type;
            }

            function closeInput(type) {
              scope.inputOpen = false;
              delete scope.commentType;
            }

            scope.addComment = function(type) {
              if (type === scope.commentType) {
                closeInput(type);
              } else {
                openInput(type);
              }
            };

            scope.submit = function() {
              comments.createNewComment(scope.comments.ids,
                                        scope.comment,
                                        scope.commentType);
            };
          }
        };
      },
      templateUrl: 'templates/arethusa.comments/comments.directive.html'
    };
  }
]);
