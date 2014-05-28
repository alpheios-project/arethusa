'use strict';
angular.module('arethusa.confEditor').directive('tagTree', function () {
  return {
    restrict: 'A',
    scope: { tags: '=' },
    link: function (scope, element, attrs) {
      var layout = dagreD3.layout().rankDir('LR').rankSep('150');
      var svg = d3.select(element[0]);
      var vis = svg.select('g');
      svg.call(d3.behavior.zoom().on('zoom', function () {
        var ev = d3.event;
        svg.select('g').attr('transform', 'translate(' + ev.translate + ') scale(' + ev.scale + ')');
      }));
      /* global dagreD3 */
      var renderer = new dagreD3.Renderer();
      var g = new dagreD3.Digraph();
      var allTags = {};
      function createNodes(obj) {
        angular.forEach(obj, function (val, key) {
          allTags[key] = val;
          g.addNode(key, { label: key });
          if (val.nested) {
            createNodes(val.nested);
          }
        });
      }
      function createEdges(tags) {
        angular.forEach(scope.tags, function (value, key) {
        });
        angular.forEach(tags, function (value, key) {
          if (value.nested) {
            angular.forEach(value.nested, function (v, k) {
              g.addEdge(k, key, k);
            });
          }
        });
      }
      createNodes(scope.tags);
      createEdges(allTags);
      renderer.layout(layout).run(g, vis);
    },
    template: '<g transform="translate(20,20)"/>'
  };
});