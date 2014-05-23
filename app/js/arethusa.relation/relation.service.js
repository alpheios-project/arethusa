"use strict";

angular.module('arethusa.relation').service('relation', function(state, configurator) {
  var self = this;

  this.conf = configurator.configurationFor('relation');
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.relationValues = this.conf.relations;
  this.relations = {};

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

  this.currentLabels = function() {
    //var that = this;
    //var res = {};
    //angular.forEach(state.selectedTokens, function(token, id) {
      //res[id] = that.rels[id];
      //var labels = res[id].label.split('_');
      //res[id].combinedLabels = {};
      //angular.forEach(labels, function(lab, i) {
        //res[id].combinedLabels[i] = lab;
      //});
    //});
    //return res;
    return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, event) {
      memo[id] = self.relations[id];
    });
  };

  function splitLabel(relation) {
    var split = relation.label.split('_');
    relation.prefix = split[0];
    relation.suffix = split[1];
  }

  this.buildLabel = function(relation) {
    var elements = [relation.prefix, relation.suffix];
    var clean = arethusaUtil.inject([], elements, function(memo, el) {
      if (el) {
        memo.push(el);
      }
    });
    relation.label = clean.join('_');
  };

  this.expandRelation = function(relation) {
    splitLabel(relation);
    return relation;
  };

  this.createInternalState = function() {
    return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
      memo[id] = {
        string: token.string,
        relation: self.expandRelation(token.relation)
      };
    });
  };

  this.init = function() {
    self.relations = self.createInternalState();
  };
});
