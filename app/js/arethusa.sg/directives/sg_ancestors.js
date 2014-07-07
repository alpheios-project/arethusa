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

        scope.requested = function(obj) {
          return sg.readerRequested.short === obj.short;
        };

        function updateHierarchy(ancestors) {
          scope.hierarchy = scope.obj.definingAttrs.concat(scope.obj.ancestors);
        }

        scope.$watch('obj.hasChanged', function(newVal, oldVal) {
          if (newVal) {
            updateHierarchy();
            scope.obj.hasChanged = false;
          }
        });

        scope.$watchCollection('obj.ancestors', function(newVal, oldVal) {
          updateHierarchy();
        });
      },
      templateUrl: './templates/arethusa.sg/ancestors.html'
    };
  }
]);
