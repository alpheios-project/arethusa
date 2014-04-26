"use strict";

annotationApp.service('state', function(configurator) {
  var conf = configurator.conf_for('state');
  var tokenRetriever = configurator.getService(conf.retriever);

  var tokens;
  tokenRetriever.getData(function(res) {
    tokens = res;
  });
  this.tokens = tokens;

  this.selectedTokens = { '1' : true }; // ids will be inserted here

  this.isSelected = function(id) {
    return id in this.selectedTokens;
  };

  this.currentTokens = function() {
    var res = [];
    var that = this;
    angular.forEach(that.selectedTokens, function(val, id) {
      var token = that.tokens[id];
      if (token) {
        res.push(token);
      }
    });
    return res;
  };

  this.currentTokensAsStringList = function() {
    return $.map(
      this.currentTokens(),
      function(el, i) { return el.string}
    ).join(', ');
  };

  this.selectToken = function(id) {
    this.selectedTokens[id] = true;
  };

  this.deselectToken = function(id) {
    delete this.selectedTokens[id];
  };

  this.toggleSelection = function(id) {
    id in this.selectedTokens ? this.deselectToken(id) : this.selectToken(id);
  };
});
