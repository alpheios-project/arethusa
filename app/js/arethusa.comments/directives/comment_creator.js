"use strict";

angular.module('arethusa.comments').directive('commentCreator', [
  'comments',
  'state',
  function(comments, state, keyCapture, notifier, plugins) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var ids;

        scope.comments = comments;
        scope.state = state;
        scope.hasSelections = state.hasClickSelections;

        function currentTokens() {
          return scope.active ? 'on ' + state.toTokenStrings(scope.ids) : '';
        }

        scope.$watchCollection('state.clickedTokens', function(newVal, oldVal) {
          scope.ids = Object.keys(newVal).sort();
          scope.active = scope.ids.length;
          scope.currentTokenStrings = currentTokens();
        });

        scope.submit = function() {
          comments.createNewComment(ids, scope.comment);
        };
      },
      templateUrl: 'templates/arethusa.comments/comment_creator.html'
    };
  }
]);
