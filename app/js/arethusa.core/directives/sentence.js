"use strict";

angular.module('arethusa.core').directive('sentence', [
  'navigator',
  function(navigator) {
    return {
      restrict: 'A',
      scope: {
        sentence: '='
      },
      link: function(scope, element, attrs) {
        function sentenceToString() {
          return arethusaUtil.inject([], scope.sentence.tokens, function(memo, id, token) {
            memo.push(token.string);
          }).join(' ');
        }

        scope.goTo = function(id) {
          navigator.goTo(id);
          navigator.switchView();
        };

        scope.sentenceString = sentenceToString();
        scope.id = scope.sentence.id;
      },
      templateUrl: 'templates/arethusa.core/sentence.html'
    };
  }
]);
