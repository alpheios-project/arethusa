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

        function getCitation() {
          navigator.getCitation(scope.sentence, function(citation) {
            scope.citation = citation;
          });
        }

        scope.goTo = function(id) {
          navigator.goTo(id);
          navigator.switchView();
        };

        scope.sentenceString = sentenceToString();
        scope.id = scope.sentence.id;

        getCitation();
      },
      templateUrl: 'templates/arethusa.core/sentence.html'
    };
  }
]);
