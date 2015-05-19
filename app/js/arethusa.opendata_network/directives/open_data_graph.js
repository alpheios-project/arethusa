"use strict";

angular.module('arethusa.opendataNetwork').directive('openDataGraph', [
  'graph',
  function (Graph) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        colors: '=',
        weight: '=',
        mergeLinks: '='
      },
      link: function (scope, element, attrs) {
        var tree = new Graph(scope, element, {
          colors : scope.colors,
          weight : scope.weight,
          mergeLinks : scope.mergeLinks
        });
        tree.launch();
      },
    };
  }
]);