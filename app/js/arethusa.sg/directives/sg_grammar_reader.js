"use strict";

angular.module('arethusa.sg').directive('sgGrammarReader', [
  'sg',
  'state',
  function(sg, state) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function reader() {
          return angular.element(document.getElementById('sg-g-r'));
        }

        function clearReader() {
          reader().empty();
        }

        function addGrammar(el) {
          var r = reader();
          sg.requestGrammar(el.sections, function(sections) {
            r.append(sections);
          });
        }

        scope.s = state;
        scope.sg = sg;
        scope.isVisible = function() {
          return sg.readerRequested && state.hasSelections();
        };

        scope.$watch('sg.readerRequested', function(newVal, oldVal) {
          if (newVal) {
            clearReader();
            addGrammar(newVal);
          }
        });
      },
      templateUrl: 'templates/arethusa.sg/sg_grammar_reader.html'
    };
  }
]);
