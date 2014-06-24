"use strict";

angular.module('arethusa.sg').directive('sgAncestors', [
  'sg',
  function(sg) {
    return {
      restrict: 'A',
      scope: {
        obj: '=sgAncestors'
      },
      link: function(scope, element, attrs) {
        scope.requestGrammar = function(el) {
          if (el.sections) {
            if (sg.readerRequested === el) {
              sg.readerRequested = false;
            } else {
              sg.readerRequested = el;
            }
          }
        };

        scope.$watchCollection('obj.ancestors', function(newVal, oldVal) {
          scope.hierarchy = scope.obj.definingAttrs.concat(newVal);
        });
      },
      templateUrl: './templates/arethusa.sg/ancestors.html'
    };
  }
]);
