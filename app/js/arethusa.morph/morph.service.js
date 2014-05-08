"use strict";

/* global arethusaUtil */

angular.module('arethusa.morph').service('morph', function(state, configurator) {
  this.conf = configurator.configurationFor('morph');
  this.attributes = this.conf.attributes;
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.postagSchema = this.conf.postagSchema;

  var morphRetrievers = configurator.getServices(this.conf.retrievers);

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

  // Probably not useful to calculate this everytime...
  this.emptyPostag = function() {
    return arethusaUtil.map(this.postagSchema, function(el) {
      return '-';
    }).join('');
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
  this.getAnalysisFromState = function(val, id) {
    var analysis = state.tokens[id].morphology;
    // We could always have no analysis sitting in the data we are
    // looking at.
    if (analysis) {
      this.postagToAttributes(analysis);
      analysis.origin = 'document';
      val.forms.push(analysis);
    }
  };

  this.getExternalAnalyses = function(analysisObj, that) {
    morphRetrievers.forEach(function(retriever) {
      retriever.getData(analysisObj.string, function(res) {
        // need to parse the attributes now
        res.forEach(function(el) {
          el.postag = that.attributesToPostag(el.attributes);
        });
        arethusaUtil.pushAll(analysisObj.forms, res);
      });
    });
  };

  this.loadInitalAnalyses = function(that) {
    var analyses = that.seedAnalyses(state.tokens);
    angular.forEach(analyses, function(val, id) {
      that.getExternalAnalyses(val, that);
      that.getAnalysisFromState(val, id);
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

