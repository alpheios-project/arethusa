"use strict";

angular.module('arethusa.sg').directive('sgGrammarReader', [
  'sg',
  'state',
  function(sg, state) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function addGrammar(el) {
          sg.requestGrammar(el.sections, function(res) {
            // add the html in res.data to our reader
          });
        }

        scope.s = state;
        scope.sg = sg;
        scope.isVisible = function() {
          return sg.readerRequested && state.hasSelections();
        };

        scope.$watch('sg.readerRequested', function(newVal, oldVal) {
          if (newVal) addGrammar(newVal);
        });
      },
      templateUrl: 'templates/arethusa.sg/sg_grammar_reader.html'
    };
  }
]);
