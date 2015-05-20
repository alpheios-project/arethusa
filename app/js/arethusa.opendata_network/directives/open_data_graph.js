"use strict";

angular.module('arethusa.opendataNetwork').directive('openDataGraph', [
  'graph',
  function (Graph) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        conf: '='
      },
      link: function (scope, element, attrs) {
        var tree = new Graph(scope, element, scope.conf);
        tree.launch();
      },
    };
  }
]);