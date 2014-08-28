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

    this.addDefaultInsertionPoint = function() {
      if (!self.model.insertionPoint) {
        var lastId = aU.last(Object.keys(state.tokens).sort());
        var unextended = idHandler.stripExtension(lastId);
        self.model.insertionPoint = state.getToken(unextended);
        self.insertBehind = true;
      }
    };


    function resetModel() {
      self.model = new ArtificialToken();
      if (self.defaultInsertionPoint) self.addDefaultInsertionPoint();
    }

    function ArtificialToken (string, type) {
      var self = this;
      this.string = string;
      this.type   = type || 'elliptic';
      this.artificial = true;
      this.idMap = new idHandler.Map();
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

    var count;
    function setString() {
      if (! self.model.string) {
        self.model.string = '[' + count + ']';
        count++;
      }
    }

    function findNextPlacerHolderCount() {
      var strings = arethusaUtil.inject([], self.createdTokens, function(memo, id, token) {
        var match = /\[(\d+)\]/.exec(token.string);
        if (match) {
          memo.push(match[1]);
        }
      }).sort();
      count = strings.length === 0 ? 0 : parseInt(strings[strings.length - 1]) + 1;
    }

    this.modelValid = function() {
      return self.model.type && self.model.insertionPoint;
    };

    function recountATs() {
      self.count = Object.keys(self.createdTokens).length;
    }

    function findArtificialTokensInState() {
      angular.forEach(state.tokens, function(token, id) {
        if (token.artificial) {
          addArtificialToken(id, token);
        }
      });
    }

    function addArtificialToken(id, token) {
      self.createdTokens[id] = token;
      recountATs();
    }

    function removeArtificialToken(id) {
      delete self.createdTokens[id];
      recountATs();
    }

    this.removeToken = state.removeToken;

    function findNextNewId(id) {
      var artificialIds = Object.keys(self.createdTokens);
      while (arethusaUtil.isIncluded(artificialIds, id)) {
        id = idHandler.increment(id);
      }
      return id;
    }

    this.insertBehind = false;

    this.propagateToState = function() {
      setString();
      var id = self.model.insertionPoint.id;
      var newId = self.insertBehind ? id : idHandler.decrement(id);
      if (!idHandler.isExtendedId(id)) {
        newId = idHandler.extendId(newId);
      }
      newId = findNextNewId(newId);
      self.model.id = newId;
      state.addToken(self.model, newId);
      resetModel();
    };

    state.on('tokenAdded', function(event, token) {
      addArtificialToken(token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      removeArtificialToken(token.id);
    });


    this.init = function() {
      configure();
      findArtificialTokensInState();
      findNextPlacerHolderCount();
    };
  }
]);
