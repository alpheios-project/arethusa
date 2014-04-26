"use strict";

annotationApp.service('state', function(configurator) {
  var conf = configurator.conf_for('state');
  var tokenRetriever = configurator.getService(conf.retriever);

  var tokens;
  tokenRetriever.getData(function(res) {
    tokens = res;
  });
  this.tokens = tokens;

  this.selectedToken = {};

  this.currentToken = function() {
    return this.tokens[this.selectedToken.id] || {};
  };

  this.selectToken = function(id) {
    this.selectedToken.id = id;
  };
});
