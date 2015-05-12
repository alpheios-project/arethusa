"use strict";

angular.module('arethusa.opendataNetwork').directive('openDataGraph', [
  'graph',
  function (Graph) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        styles: '='
      },
      link: function (scope, element, attrs) {
        var tree = new Graph(scope, element);
        tree.launch();
      },
    };
  }
]);