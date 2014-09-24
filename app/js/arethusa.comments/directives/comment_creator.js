"use strict";

angular.module('arethusa.comments').directive('commentCreator', [
  'comments',
  'state',
  'translator',
  function(comments, state, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var ids, onTrsl;

        scope.comments = comments;
        scope.state = state;
        scope.hasSelections = state.hasClickSelections;

        translator('on', function(translation) {
          onTrsl = translation;
          scope.currentTokenStrings = currentTokens();
        });

        function currentTokens() {
          return scope.active ? onTrsl + ' ' + state.toTokenStrings(scope.ids) : '';
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
