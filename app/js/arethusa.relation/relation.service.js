"use strict";

angular.module('arethusa.relation').service('relation', function(state, configurator) {
  this.conf = configurator.configurationFor('relation');
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.relations = this.conf.relations;

  this.currentLabels = function() {
    var tokens = state.tokens;
    var res = {};
    angular.forEach(state.selectedTokens, function(val, id) {
      res[id] = { string: tokens[id].string, label: tokens[id].relation.label };
    });
    return res;
  };

  this.init = function() {
    // tbd
  };
});
