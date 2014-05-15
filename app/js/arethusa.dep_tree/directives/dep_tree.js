"use strict";

angular.module('arethusa.depTree').directive('tree', function(depTree) {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      var graph = depTree.createDigraph();
      var layout = depTree.createGraphLayout();
      depTree.drawGraph(graph, layout);
    },
    template: '<svg height=600px><g transform="translate(20,20)"/></svg>'
  };
});
