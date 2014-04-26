"use strict";

annotationApp.service('morph', function(state, configurator) {
  this.conf = configurator.conf_for('morph');
  var morphRetriever = configurator.getService(this.conf.retriever);

  this.seedAnalyses = function(tokens) {
    var analyses = {};
    angular.forEach(tokens, function(token, id) {
      analyses[id] = { string: token.string, forms: [], analyzed: false };
    });
    return analyses;
  };

  this.getAnalyses = function(string) {
    var result;
    morphRetriever.getData(string, function(res) {
      result = res;
    });
    return result;
  };

  this.loadInitalAnalyses = function(that) {
    var analyses = that.seedAnalyses(state.tokens);
    angular.forEach(analyses, function(val, id) {
      var forms = that.getAnalyses(val.string);
      val.analyzed = true;
      val.forms = val.forms.concat(forms);
    });
    return analyses;
  };

  this.analyses = this.loadInitalAnalyses(this);

  this.currentAnalyses = function() {
    var res = [];
    var that = this;
    angular.forEach(state.selectedTokens, function(val, id) {
      var token = that.analyses[id];
      if (token) {
        res.push(token);
      }
    });
    return res;
  };

  this.currentForms = function() {
    return this.currentAnalysis().forms;
  };

  this.longAttributeName = function(attr) {
    return this.attributes[attr].long;
  };

  this.attributes = this.conf.attributes;
  this.template = this.conf.template;
});

