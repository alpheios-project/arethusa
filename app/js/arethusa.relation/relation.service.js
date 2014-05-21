"use strict";

angular.module('arethusa.relation').service('relation', function(state, configurator) {
  this.conf = configurator.configurationFor('relation');
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.relations = this.conf.relations;
  this.rels = {};

  this.currentLabels = function() {
    var that = this;
    var res = {};
    angular.forEach(state.selectedTokens, function(token, id) {
      res[id] = that.rels[id];
    });
    return res;
  };

  this.selectLabel = function(attr) {
    return this.relations[attr] || {};
  };

  this.longLabelName = function(attr) {
    var that = this;
    var res = [];
    var label = this.selectLabel(attr).long;
    if ( label ) {
      res.push(label);
    } else {
      // if two labels are combined to one with a _
      // it needs to be split, e.g. PRED_CO
      var labels = attr.split('_');
      angular.forEach(labels, function(val, key) {
        res = res.concat(that.longLabelName(val));
      });
    }
    return res;
  };

  this.init = function() {
    var tokens = state.tokens;
    var that = this;
    angular.forEach(tokens, function(val, id) {
      that.rels[id] = { string: tokens[id].string, label: tokens[id].relation.label };
    });
  };
});
