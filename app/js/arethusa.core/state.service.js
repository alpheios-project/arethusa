"use strict";

angular.module('arethusa.core').service('state', function(configurator) {
  var conf = configurator.configurationFor('state');
  var tokenRetriever = configurator.getService(conf.retriever);

  var temp_tokens;
  tokenRetriever.getData(function(res) {
    temp_tokens = res;
  });
  this.tokens = temp_tokens;

  this.asString = function(id) {
    return this.tokens[id].string;
  };

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

  // type should be either 'click' or 'hover'
  this.selectToken = function(id, type) {
    if (this.isSelectable(this.selectionType(id), type)) {
      this.selectedTokens[id] = type;
    }
  };

  this.selectionType = function(id) {
    return this.selectedTokens[id];
  };

  this.isSelectable = function(oldVal, newVal) {
    // if an element was hovered, we only select it when another
    // selection type is present (such as 'click'), if there was
    // no selection at all (oldVal === undefined), we select too
    return (oldVal === 'hover' && newVal !== 'hover') || (! oldVal);
  };

  this.deselectToken = function(id, type) {
    // only deselect when the old selection type is the same as
    // the argument, i.e. a hover selection can only deselect a
    // hover selection, but not a click selection
    if (this.selectionType(id) === type) {
      delete this.selectedTokens[id];
    }
  };

  this.toggleSelection = function(id, type) {
    // only deselect when the selectionType is the same.
    // a hovered selection can still be selected by click.
    if (this.isSelected(id) && this.selectionType(id) == type) {
      this.deselectToken(id, type);
    } else {
      this.selectToken(id, type);
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
    this.selectToken(newId, 'click');
  };

  this.selectNextToken = function() { this.selectSurroundingToken('next'); };
  this.selectPrevToken = function() { this.selectSurroundingToken('prev'); };

  // Listeners can be internal (angular-implementation) or external (everything
  // else). The future might bring a further distinction between different
  // of events listeners listen to - we'll see.
  this.listeners = [];
  this.externalListeners= [];

  this.registerListener = function(listener) {
    if (listener.external) {
      this.externalListeners.push(listener);
    } else {
      this.listeners.push(listener);
    }
  };

  this.fireEvent = function(target, property, oldVal, newVal) {
    var event = { target: target, property: property, oldVal: oldVal, newVal: newVal };
    event.time = new Date();
    this.notifyListeners(event);
  };

  this.notifyListeners = function(event) {
    this.notifyAngularListeners(event);
    this.notifyExternalListeners(event);
  };

  this.notifyAngularListeners = function(event) {
    angular.forEach(this.listeners, function(obj, i) {
      obj.catchEvent(event);
    });
  };

  this.notifyExternalListeners = function(event) {
    angular.forEach(this.externalListeners, function(obj, i) {
      obj.catchArethusaEvent(event);
    });
  };

  this.setState = function(id, category, val) {
    var token = this.tokens[id];
    var oldVal = token[category];
    this.fireEvent(token, category, oldVal, val);
    token[category] = val;
  };

  this.unsetState = function(id, category) {
    var token = this.tokens[id];
    var oldVal = token[category];
    this.fireEvent(token, category, oldVal,  null);
    delete token[category];
  };
});
