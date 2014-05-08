"use strict";

/* global arethusaUtil */

angular.module('arethusa.morph').service('morph', function(state, configurator) {
  this.conf = configurator.configurationFor('morph');
  this.attributes = this.conf.attributes;
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.postagSchema = this.conf.postagSchema;

  var morphRetriever = configurator.getService(this.conf.retriever);

  this.seedAnalyses = function(tokens) {
    var analyses = {};
    angular.forEach(tokens, function(token, id) {
      analyses[id] = { string: token.string, forms: [], analyzed: false };
    });
    return analyses;
  };

  this.postagToAttributes = function(form) {
    var that = this;
    var attrs = {};
    angular.forEach(form.postag, function(postagVal, i) {
      var postagClass  = that.postagSchema[i];
      var possibleVals = that.attributeValues(postagClass);
      var attrObj = arethusaUtil.findObj(possibleVals, function(obj) {
        return obj.postag === postagVal;
      });

      // attrObj can be undefined when the postag is -
      if (attrObj) {
        attrs[postagClass] = attrObj.short;
      }
    });
    form.attributes = attrs;
  };

  this.attributesToPostag = function(attrs) {
    var postag = "";
    var that = this;
    var postagArr =  arethusaUtil.map(this.postagSchema, function(el) {
      var attrVals = that.attributeValues(el);
      var val = attrs[el];
      var valObj = arethusaUtil.findObj(attrVals, function(e) {
        return e.short === val;
      });
      return (valObj ? valObj.postag : '-');
    });
    return postagArr.join('');
  };

  // Gets a from the inital state - if we load an already annotated
  // template, we have to take it inside the morph plugin.
  // In the concrete use case of treebanking this would mean that
  // we have a postag value sitting there, which we have to expand.
  this.getAnalysisFromState = function(id) {
    var analysis = state.tokens[id].morphology;
    this.postagToAttributes(analysis);
    return analysis;
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
      var externalForms = that.getExternalAnalyses(val.string);
      externalForms.forEach(function(el) {
        el.postag = that.attributesToPostag(el.attributes);
      });
      val.forms.push(that.getAnalysisFromState(id));
      arethusaUtil.pushAll(val.forms, externalForms);
      val.analyzed = true;
    });
    return analyses;
  };

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
    angular.forEach(form.attributes, function(value, key) {
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

  this.analyses = this.loadInitalAnalyses(this);
});

