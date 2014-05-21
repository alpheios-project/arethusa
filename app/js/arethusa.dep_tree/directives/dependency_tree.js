"use strict";

/* global dagreD3 */

angular.module('arethusa.depTree').directive('dependencyTree', function(depTree, state, $compile) {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      var tokens = scope.$eval(attrs.tokens);
      var g = new dagreD3.Digraph();


      scope.state = state;

      g.addNode("0000", { label: "[-]"});
      angular.forEach(tokens, function(token, index) {
        g.addNode(token.id, { label: '<div id="' + token.id + '" class="node">' + token.string + '</div>' /*parent[0].innerHTML*/ });
      });


      function edgePlaceholder(label) {
        return '<div class="tree-label">' + label + '</div>';
      }

      angular.forEach(tokens, function(word, index) {
        if (word.head) {
          g.addEdge(word.id, word.id, word.head.id, { label: edgePlaceholder(word.relation.label) });
        }
      });

      var layout = depTree.createGraphLayout();

      var svg = d3.select('svg')
        .call(d3.behavior.zoom().on("zoom", function() {
           var ev = d3.event;
           svg.select("g")
              .attr("transform", "translate(" + ev.translate + ") scale(" + ev.scale + ")");
      }));
      var vis = svg.select('g');

      var renderer = new dagreD3.Renderer();

      renderer.layout(layout).run(g, vis);

      var tokenHtml = '<token ng-mouseenter="state.selectToken(token.id, \'hover\')" ng-mouseleave="state.deselectToken(token.id, \'hover\')" ng-class="{selected: state.isSelected(token.id)}"></token>';

      vis.selectAll("div.node").append(function() {
        var parent = angular.element(this)[0];
        var childScope = scope.$new();
        childScope.token = tokens[parent.id];
        parent.textContent = "";

        return $compile(tokenHtml)(childScope)[0];
      });

      // Not very elegant, but we don't want marker-end arrowheads right now
      vis.selectAll("g.edgePath path").attr('marker-end', '');
    },
    template: '<svg><g transform="translate(20,20)"/></svg>'
  };
});
