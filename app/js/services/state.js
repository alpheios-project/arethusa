"use strict";

annotationApp.service('state', function(configurator) {
  var conf = configurator.conf_for('state');
  var tokenRetriever = configurator.getService(conf.retriever);

  var tokens;
  tokenRetriever.getData(function(res) {
    tokens = res;
  });
  this.tokens = tokens;

  this.selectedToken = {}; // an id value will be inserted here

  this.isSelected = function(token) {
    return token.id == this.selectedToken.id;
  };

  this.currentToken = function() {
    return this.tokens[this.selectedToken.id] || {};
  };

  this.selectToken = function(id) {
    this.selectedToken.id = id;
  };

  this.deselectToken = function() {
    this.selectedToken = {};
  };

  this.toggleSelection = function(id) {
    this.selectedToken.id === id ? this.deselectToken() : this.selectToken(id);
  };
});
