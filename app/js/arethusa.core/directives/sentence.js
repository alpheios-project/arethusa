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
        function getCitation() {
          navigator.getCitation(scope.sentence, function(citation) {
            scope.citation = citation;
          });
        }

        scope.goTo = function(id) {
          navigator.goTo(id);
          navigator.switchView();
        };

        scope.sentenceString = scope.sentence.toString();
        scope.id = scope.sentence.id;

        getCitation();
      },
      templateUrl: 'templates/arethusa.core/sentence.html'
    };
  }
]);
