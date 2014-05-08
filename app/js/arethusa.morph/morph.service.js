"use strict";

angular.module('arethusa.morph').service('morph', function(state, configurator) {
  this.conf = configurator.configurationFor('morph');
  var morphRetriever = configurator.getService(this.conf.retriever);

  this.seedAnalyses = function(tokens) {
    var analyses = {};
    angular.forEach(tokens, function(token, id) {
      analyses[id] = { string: token.string, forms: [], analyzed: false };
    });
    return analyses;
  };

  // Gets a from the inital state - if we load an already annotated
  // template, we have to take it inside the morph plugin.
  // In the concrete use case of treebanking this would mean that
  // we have a postag value sitting there, which we have to expand.
  this.getAnalysisFromState = function(id) {
    return state.tokens[id].morphology;
  };

  // Calls the external morph retriever - this should be asynchronous.
  // We'll deal with that soon - and also use this chance to solve
  // this in a more functional programming style.
  this.getExternalAnalyses = function(string) {
    var result;
    morphRetriever.getData(string, function(res) {
      result = res;
    });
    return result;
  };

  this.loadInitalAnalyses = function(that) {
    var analyses = that.seedAnalyses(state.tokens);
    angular.forEach(analyses, function(val, id) {
      val.forms.push(that.getAnalysisFromState(id));
      val.forms.push.apply(val.forms,that.getExternalAnalyses(val.string));
      val.analyzed = true;
    });
    return analyses;
  };

  this.analyses = this.loadInitalAnalyses(this);

  this.currentAnalyses = function() {
    var res = {};
    var that = this;
    angular.forEach(state.selectedTokens, function(val, id) {
      var token = that.analyses[id];
      if (token) {
        res[id] = token;
      }
    });
    return res;
  };

  this.selectAttribute = function(attr) {
    return this.attributes[attr] || {};
  };

  this.longAttributeName = function(attr) {
    return this.selectAttribute(attr).long;
  };

  this.attributeValues = function(attr) {
    return this.selectAttribute(attr).values || {};
  };
  this.attributeValueObj = function(attr, val) {
    return this.attributeValues(attr)[val] || {};
  };

  this.longAttributeValue = function(attr, val) {
    return this.attributeValueObj(attr, val).long;
  };

  this.abbrevAttributeValue = function(attr, val) {
    return this.attributeValueObj(attr, val).short;
  };

  this.concatenatedAttributes = function(form) {
    var res = [];
    var that = this;
    delete form.$$hashKey; // when angular interferes
    angular.forEach(form, function(value, key) {
      res.push(that.abbrevAttributeValue(key, value));
    });
    return res.join('.');
  };

  this.setState = function(id, form) {
    state.setState(id, 'morphology', form);
  };

  this.unsetState = function(id) {
    state.unsetState(id, 'morphology');
  };

  this.isFormSelected = function(id, form) {
    return state.tokens[id].morphology == form;
  };

  this.attributes = this.conf.attributes;
  this.template = this.conf.template;
  this.name = this.conf.name;
});

