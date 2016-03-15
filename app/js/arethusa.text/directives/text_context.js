"use strict";

angular.module('arethusa.text').directive('textContext', [
  'navigator',
  function(navigator) {
    return {
      restrict: 'A',
      scope: {
        sentence: '=textContext'
      },
      link: function(scope, element, attrs) {
        scope.$watch('sentence', function(newVal, oldVal) {
          scope.context = scope.sentence ? scope.sentence.toString() : '';
        });

        scope.goToSentence = function() {
          if (scope.sentence) {
            navigator.goTo(scope.sentence.id);
          }
        };
      },
      templateUrl: 'js/arethusa.text/templates/text_context.html'
    };
  }
]);
