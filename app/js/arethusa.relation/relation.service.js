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
      var labels = res[id].label.split('_');
      res[id].combinedLabels = {};
      angular.forEach(labels, function(lab, i) {
        res[id].combinedLabels[i] = lab;
      });
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
      angular.forEach(labels, function(val, id) {
        res = res.concat(that.longLabelName(val));
      });
    }
    return res;
  };

  this.setState = function(id, label) {
    state.setState(id, 'relation', label);
  };

  this.unsetState = function(id) {
    state.unsetState(id, 'relation');
  };

  this.isLabelSelected = function(id, label) {
    return state.tokens[id].relation == label;
  };

  this.buildTokens = function() {
    var tokens = state.tokens;
    var res = {};
    angular.forEach(tokens, function(val, id) {
      res[id] = tokens[id];
    });
    return res;
  };

  this.init = function() {
    var tokens = this.buildTokens();
    var that = this;
    angular.forEach(tokens, function(val, id) {
      var token = tokens[id];
      that.rels[id] = { string: token.string, label: token.relation.label };
    });
  };
});
