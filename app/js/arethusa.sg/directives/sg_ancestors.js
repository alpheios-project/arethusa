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
        scope.$watchCollection('obj.ancestors', function(newVal, oldVal) {
          scope.hierarchy = scope.obj.definingAttrs.concat(newVal);
        });
      },
      templateUrl: './templates/arethusa.sg/ancestors.html'
    };
  }
]);
