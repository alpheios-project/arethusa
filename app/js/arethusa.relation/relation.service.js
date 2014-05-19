"use strict";

angular.module('arethusa.relation').service('relation', function(state, configurator) {
  this.conf = configurator.configurationFor('relation');
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.relations = this.conf.relations;

  this.currentLabels = function() {
    var label = {};
    angular.forEach(state.selectedTokens, function(val, id) {
      label[id] = state.tokens[id].relation.label;
    });
    return label;
  };

  this.init = function() {
    // tbd
  };
});
