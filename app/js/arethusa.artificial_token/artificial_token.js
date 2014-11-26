"use strict";

angular.module('arethusa.artificialToken').service('artificialToken', [
  'state',
  'configurator',
  'idHandler',
  function(state, configurator, idHandler) {
    var self = this;
    this.name = "artificialToken";

    var confKeys = [
      "defaultInsertionPoint"
    ];

    this.defaultConf = {
      displayName: "aT"
    };

    function configure() {
      configurator.getConfAndDelegate(self, confKeys);
      self.createdTokens = {};
      self.count = 0;
      delete self.mode;
      resetModel();
    }

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

    function handleTerminatorState() {
      if (self.insertBehind) {
        var iP = self.model.insertionPoint;
        if (iP.terminator) {
          self.model.terminator = true;
          iP.terminator = false;
        } else {
          // Could be that this token is inserted behind the last token
          // of a sentence, which might not a terminator anymore, when
          // another aT claimed that place.
          var lastATInFront = self.createdTokens[idHandler.decrement(self.model.id)];
          if (lastATInFront) {
            self.model.terminator = true;
            lastATInFront.terminator = false;
          }
        }
      }
    }

    this.insertBehind = false;

    this.propagateToState = function() {
      setString();
      var iP = self.model.insertionPoint;
      var id = iP.id;
      var newId = self.insertBehind ? id : idHandler.decrement(id);
      if (!idHandler.isExtendedId(id)) {
        newId = idHandler.extendId(newId);
      }
      newId = findNextNewId(newId);
      self.model.id = newId;
      self.model.sentenceId = iP.sentenceId;

      handleTerminatorState();

      state.addToken(self.model, newId);
      resetModel();
    };

    state.on('tokenAdded', function(event, token) {
      addArtificialToken(token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      removeArtificialToken(token.id);
    });

    this.settings = [
      { directive: 'artificial-token-toggle' },
      { directive: 'artificial-token-default-ip' }
    ];


    this.init = function() {
      configure();
      findArtificialTokensInState();
      findNextPlacerHolderCount();
    };
  }
]);
