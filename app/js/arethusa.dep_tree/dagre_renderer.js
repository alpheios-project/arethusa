"use strict";

/* global dagreD3 */
angular.module('arethusa.depTree').factory('DagreRenderer', [
  function() {
    return function() {
      var self = this;

      this.renderer = new dagreD3.Renderer();

      this.transition = function(fn) {
        self.renderer.transition(fn);
      };

      this.run = function(layout, nodeSet, graph) {
        self.renderer.layout(layout).run(nodeSet, graph);
      };
    };
  }
]);
