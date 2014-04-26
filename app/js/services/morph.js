"use strict";

annotationApp.service('morph', function(state, configurator) {
  this.conf = configurator.conf_for('morph');
  var morphRetriever = configurator.getService(this.conf.retriever);

  var analyses;
  morphRetriever.getData(function(res) {
    analyses = res;
  });
  this.analyses = analyses;

  this.currentAnalysis = function() {
    return this.analyses[state.selectedToken.id - 1];
  };

  this.template = this.conf.template;
});

