"use strict";

angular.module('arethusa.depTree').service('depTree', function(state, configurator) {
  this.conf = configurator.configurationFor('depTree');
  this.template = this.conf.template;
  this.main = this.conf.main;

  this.createDigraph = function() {
    /* global dagreD3 */
    var g = new dagreD3.Digraph();

    g.addNode("0000", { label: "[-]"});
    angular.forEach(state.tokens, function(word, index) {
      g.addNode(word.id, { label: word.string });
    });

    angular.forEach(state.tokens, function(word, index) {
      if (word.head) {
        g.addEdge(word.id, word.id, word.head.id, { label: word.relation.label });
      }
    });

    return g;
  };

  this.createGraphLayout = function() {
    return dagreD3.layout().rankDir("BT");
  };

  this.drawGraph = function(graph, layout) {
    var vis = d3.select('svg g');
    var renderer = new dagreD3.Renderer();
    renderer.layout(layout).run(graph, vis);
  };

  this.init = function() {
  };
});
