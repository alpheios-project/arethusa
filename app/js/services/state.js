"use strict";

annotationApp.service('state', function(configurator) {
  var conf = configurator.conf_for('state');
  var tokenRetriever = configurator.getService(conf.retriever);

  var tokens;
  tokenRetriever.getData(function(res) {
    tokens = res;
  });
  this.tokens = tokens;

  this.selectedTokens = {}; // ids will be inserted here

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
      function(el, i) {
        return el.string;
      }
    ).join(', ');
  };

  this.selectToken = function(id) {
    this.selectedTokens[id] = true;
  };

  this.deselectToken = function(id) {
    delete this.selectedTokens[id];
  };

  this.toggleSelection = function(id) {
    if (this.isSelected(id)) {
      this.deselectToken(id);
    } else {
      this.selectToken(id);
    }
  };

  this.deselectAll = function() {
    for (var el in this.selectedTokens) delete this.selectedTokens[el];
  };

  this.selectSurroundingToken = function(direction) {
    // take the first current selection
    var firstId = Object.keys(this.selectedTokens)[0];
    var allIds  = Object.keys(this.tokens);
    var index = allIds.indexOf(firstId);

    // select newId - make a roundtrip if we reached the bounds of the array
    var newId;
    switch(direction) {
      case "next": 
        newId = allIds[index + 1] || allIds[0]; break;
      case "prev":
        newId = allIds[index - 1] || allIds[allIds.length - 1]; break;
    }

    // deselect all previously selected tokens
    this.deselectAll();
    // and select the new one
    this.selectToken(newId);
  };

  this.selectNextToken = function() { this.selectSurroundingToken('next'); };
  this.selectPrevToken = function() { this.selectSurroundingToken('prev'); };
});
