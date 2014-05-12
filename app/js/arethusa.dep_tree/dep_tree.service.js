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

});
