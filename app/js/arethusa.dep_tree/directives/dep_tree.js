"use strict";

/* global dagreD3 */

angular.module('arethusa.depTree').directive('tree', function(depTree, state, $compile) {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      var g = new dagreD3.Digraph();

      g.addNode("0000", { label: "[-]"});
      angular.forEach(state.tokens, function(token, index) {
        g.addNode(token.id, { label: '<div id="' + token.id + '" class="node">' + token.string + '</div>' /*parent[0].innerHTML*/ });
      });

      angular.forEach(state.tokens, function(word, index) {
        if (word.head) {
          g.addEdge(word.id, word.id, word.head.id, { label: word.relation.label });
        }
      });

      var layout = depTree.createGraphLayout();
      var vis = d3.select('svg g');
      var renderer = new dagreD3.Renderer();

      renderer.layout(layout).run(g, vis);

      var tokenHtml = '<token ng-mouseenter="state.selectToken(token.id, \'hover\')" ng-mouseleave="state.deselectToken(token.id, \'hover\')" ng-class="{selected: state.isSelected(token.id)}"></token>';

      vis.selectAll("div.node").append(function() {
        var parent = angular.element(this)[0];
        var childScope = scope.$new();
        childScope.token = state.tokens[parent.id];
        parent.textContent = "";

        return $compile(tokenHtml)(childScope)[0];
      });
    },
    template: '<svg><g transform="translate(20,20)"/></svg>'
  };
});
