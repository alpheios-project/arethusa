"use strict";

angular.module('arethusa.sg').directive('sgGrammarReader', [
  'sg',
  'state',
  function(sg, state) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.s = state;
        scope.isVisible = function() {
          return sg.readerRequested && state.hasSelections();
        };
      },
      templateUrl: 'templates/arethusa.sg/sg_grammar_reader.html'
    };
  }
]);
