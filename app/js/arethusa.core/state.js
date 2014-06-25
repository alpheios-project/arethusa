'use strict';
angular.module('arethusa.core').service('state', [
  'configurator',
  'navigator',
  '$rootScope',
  'documentStore',
  'keyCapture',
  function (configurator, navigator, $rootScope, documentStore, keyCapture) {
    var self = this;
    var tokenRetrievers;

    this.documents = function() {
      return documentStore.store;
    };

    function configure() {
      var conf = configurator.configurationFor('main');
      tokenRetrievers = configurator.getRetrievers(conf.retrievers);
    }

    // We hold tokens locally during retrieval phase.
    // Once we are done, they will be exposed through
    // this.replaceState, which also triggers
    // the stateLoaded event.
    var tokens = {};

    // Loading a state
    var saveTokens = function (container, tokens) {
      angular.forEach(tokens, function (token, id) {
        var updatedToken;
        var savedToken = container[id];
        if (savedToken) {
          updatedToken = angular.extend(savedToken, token);
        } else {
          updatedToken = token;
        }
        container[id] = token;
      });
    };

    this.retrieveTokens = function () {
      var container = {};
      navigator.reset();
      self.deselectAll();
      angular.forEach(tokenRetrievers, function (retriever, name) {
        retriever.getData(function (data) {
          navigator.addSentences(data);
          navigator.updateId();
          saveTokens(container, navigator.currentSentence());
          //saveTokens(container, data[0].tokens);
          declarePreselections(retriever.preselections);
          declareLoaded(retriever);
        });
      });
      tokens = container;
    };

    this.checkLoadStatus = function () {
      var loaded = true;
      angular.forEach(tokenRetrievers, function (el, name) {
        loaded = loaded && el.loaded;
      });
      if (loaded) {
        this.replaceState(tokens, true);
      }
    };

    function declarePreselections(ids) {
      selectMultipleTokens(ids);
    }

    var declareLoaded = function (retriever) {
      retriever.loaded = true;
      self.checkLoadStatus();
    };

    // Delegators
    this.asString = function (id) {
      return this.tokens[id].string;
    };

    this.getToken = function (id) {
      return self.tokens[id] || {};
    };

    // Selections
    this.selectedTokens = {};
    // ids will be inserted here

    this.hasSelections = function() {
      return Object.keys(self.selectedTokens).length !== 0;
    };

    this.isSelected = function (id) {
      return id in this.selectedTokens;
    };

    // multi-selects tokens, given an array of ids
    this.multiSelect = function (ids) {
      self.deselectAll();
      selectMultipleTokens(ids);
    };

    function selectMultipleTokens(ids) {
      angular.forEach(ids, function (id, i) {
        self.selectToken(id, 'ctrl-click');
      });
    }

    this.changeHead = function (tokenId, newHeadId) {
      if (self.headsFor(newHeadId).indexOf(tokenId) !== -1) {
        self.tokens[newHeadId].head.id = self.tokens[tokenId].head.id;
      }
      self.tokens[tokenId].head.id = newHeadId;
    };

    this.handleChangeHead = function (newHeadId, type) {
      var preventSelection = false;
      angular.forEach(this.selectedTokens, function (type, index) {
        if (self.headCanBeChanged(index, newHeadId, type)) {
          self.changeHead(index, newHeadId);
          preventSelection = preventSelection || true;
        }
      });
      return preventSelection;
    };

    this.headCanBeChanged = function(id, newId, type) {
      return id !== newId && (type === 'click' || type === 'ctrl-click');
    };

    this.headsFor = function (id) {
      var currentToken = self.tokens[id];
      var heads = [];
      while (currentToken && currentToken.head.id) {
        var headId = currentToken.head.id;
        heads.push(headId);
        currentToken = self.tokens[headId];
      }
      return heads;
    };

    // type should be either 'click', 'ctrl-click' or 'hover'
    this.selectToken = function (id, type, changeHead) {
      var preventSelection = false;
      if (type === 'click') {
        preventSelection = changeHead ? self.handleChangeHead(id, type) : false;
        self.deselectAll();
      }
      if (!preventSelection && self.isSelectable(self.selectionType(id), type)) {
        self.selectedTokens[id] = type;
      }
    };

    this.selectionType = function (id) {
      return this.selectedTokens[id];
    };

    this.isSelectable = function (oldVal, newVal) {
      // if an element was hovered, we only select it when another
      // selection type is present (such as 'click'), if there was
      // no selection at all (oldVal === undefined), we select too
      return oldVal === 'hover' && newVal !== 'hover' || !oldVal;
    };

    this.deselectToken = function (id, type) {
      // only deselect when the old selection type is the same as
      // the argument, i.e. a hover selection can only deselect a
      // hover selection, but not a click selection
      if (this.selectionType(id) === type) {
        delete this.selectedTokens[id];
      }
    };

    this.toggleSelection = function (id, type, changeHead) {
      // only deselect when the selectionType is the same.
      // a hovered selection can still be selected by click.
      if (this.isSelected(id) && this.selectionType(id) == type) {
        this.deselectToken(id, type);
      } else {
        this.selectToken(id, type, changeHead);
      }
    };

    this.deselectAll = function () {
      for (var el in this.selectedTokens)
        delete this.selectedTokens[el];
    };

    this.selectSurroundingToken = function (direction) {
      // take the first current selection
      var firstId = Object.keys(self.selectedTokens)[0];
      var allIds = Object.keys(self.tokens);
      var index = allIds.indexOf(firstId);
      // select newId - make a roundtrip if we reached the bounds of the array
      var newId;
      switch (direction) {
      case 'next':
        newId = allIds[index + 1] || allIds[0];
        break;
      case 'prev':
        newId = allIds[index - 1] || allIds[allIds.length - 1];
        break;
      }
      // deselect all previously selected tokens
      self.deselectAll();
      // and select the new one
      self.selectToken(newId, 'click');
    };

    this.selectNextToken = function () {
      self.selectSurroundingToken('next');
    };
    this.selectPrevToken = function () {
      self.selectSurroundingToken('prev');
    };

    // Events
    // Listeners can be internal (angular-implementation) or external (everything
    // else). The future might bring a further distinction between different
    // of events listeners listen to - we'll see.
    this.listeners = [];
    this.externalListeners = [];

    this.registerListener = function (listener) {
      if (listener.external) {
        this.externalListeners.push(listener);
      } else {
        this.listeners.push(listener);
      }
    };

    this.fireEvent = function (target, property, oldVal, newVal) {
      var event = {
          target: target,
          property: property,
          oldVal: oldVal,
          newVal: newVal
        };
      event.time = new Date();
      this.notifyListeners(event);
    };

    this.notifyListeners = function (event) {
      this.notifyAngularListeners(event);
      this.notifyExternalListeners(event);
    };

    this.notifyAngularListeners = function (event) {
      angular.forEach(this.listeners, function (obj, i) {
        obj.catchEvent(event);
      });
    };

    this.notifyExternalListeners = function (event) {
      angular.forEach(this.externalListeners, function (obj, i) {
        obj.catchArethusaEvent(event);
      });
    };

    this.setState = function (id, category, val) {
      var token = this.tokens[id];
      var oldVal = token[category];
      this.fireEvent(token, category, oldVal, val);
      token[category] = val;
    };

    this.unsetState = function (id, category) {
      var token = this.tokens[id];
      var oldVal = token[category];
      this.fireEvent(token, category, oldVal, null);
      delete token[category];
    };

    this.replaceState = function (tokens, keepSelections) {
      // We have to wrap this as there might be watchers on allLoaded,
      // such as the MainCtrl which has to reinit all plugins when the
      // state tokens are replaced
      if (!keepSelections) self.deselectAll();
      self.tokens = tokens;
      self.broadcastReload();
    };

    this.setStyle = function (id, style) {
      self.getToken(id).style = style;
    };

    this.unsetStyle = function (id) {
      delete self.getToken(id).style;
    };

    this.broadcastReload = function () {
      $rootScope.$broadcast('stateLoaded');
    };

    this.addStatusObjects = function () {
      angular.forEach(self.tokens, function (token, id) {
        token.status = {};
      });
    };

    this.countTotalTokens = function () {
      self.totalTokens = Object.keys(self.tokens).length;
    };

    this.countTokens = function (conditionFn) {
      var count = 0;
      angular.forEach(self.tokens, function (token, id) {
        if (conditionFn(token)) {
          count++;
        }
      });
      return count;
    };

    this.postInit = function () {
      self.addStatusObjects();
      self.countTotalTokens();
    };

    function initKeyCaptures() {
      var kC = keyCapture;
      var conf = kC.conf('selections');
      var nextKey = conf.nextToken || 'J';
      var prevKey = conf.prevToken || 'K';

      var captures = {
        esc: function() { self.deselectAll(); }
      };

      captures[nextKey] = function() { kC.doRepeated(self.selectNextToken); };
      captures[prevKey] = function() { kC.doRepeated(self.selectPrevToken); };

      keyCapture.registerCaptures(captures);
    }

    this.init = function () {
      configure();
      self.retrieveTokens();
      initKeyCaptures();
    };
  }
]);
