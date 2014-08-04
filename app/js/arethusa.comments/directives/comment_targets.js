"use strict";

angular.module('arethusa.comments').directive('commentTargets', [
  'comments',
  'idHandler',
  function(comments, idHandler) {
    return {
      restrict: 'A',
      scope: {
        tokens: "=commentTargets"
      },
      link: function(scope, element, attrs) {
        function ids() {
          return arethusaUtil.map(scope.tokens, function(token) {
            return token.id;
          }).sort();
        }

        scope.nonSequential = idHandler.nonSequentialIds(ids());
      },
      templateUrl: 'templates/arethusa.comments/comment_targets.html'

    };
  }
]);
