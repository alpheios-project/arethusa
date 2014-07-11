"use strict";

angular.module('arethusa.artificialToken').service('artificialToken', [
  'state',
  'configurator',
  'idHandler',
  function(state, configurator, idHandler) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('artificialToken', self);
      self.createdTokens = {};
      self.count = 0;
      delete self.mode;
      resetModel();
    }

    configure();

    function resetModel() {
      self.model = new ArtificialToken();
    }

    function ArtificialToken (string, type) {
      var self = this;
      this.string = string;
      this.type   = type || 'elliptic';
      this.artificial = true;
    }

    this.supportedTypes = [
      'elliptic'
    ];


    this.setType = function(type) {
      self.model.type = type;
    };

    this.hasType = function(type) {
      return self.model.type === type;
    };

    this.toggleMode = function(mode) {
      if (self.mode === mode) {
        delete self.mode;
      } else {
        self.mode = mode;
      }
    };

    var count = 0;

    function setString() {
      if (! self.model.string) {
        self.model.string = '[' + count + ']';
        count++;
      }
    }

    this.modelValid = function() {
      return self.model.type && self.model.insertionPoint;
    };

    function idIdentifier(id) {
      return 'a';
    }

    function recountATs() {
      self.count = Object.keys(self.createdTokens).length;
    }

    function addArtificialToken(id, token) {
      self.createdTokens[id] = self.model;
      recountATs();
    }

    function removeArtificialToken(id) {
      delete self.createdTokens[id];
      recountATs();
    }

    this.removeToken = function(id) {
      state.removeToken(id);
      removeArtificialToken(id);
    };

    this.propagateToState = function() {
      setString();
      var id = self.model.insertionPoint.id;
      var idBefore = idHandler.decrement(id);
      var newId = idBefore + idIdentifier(idBefore);
      self.model.id = newId;
      addArtificialToken(newId, self.model);
      state.addToken(self.model, newId);
      resetModel();
    };


    this.init = function() {
      configure();
    };
  }
]);
