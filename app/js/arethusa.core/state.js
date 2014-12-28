'use strict';

/**
 * @ngdoc service
 * @name arethusa.core.state
 *
 * @description
 * One of Arethusa's key components, typically injected by every plugin.
 *
 * 1. Retrieves documents
 * 2. Holds the current annotation targets - tokens - presented to the user
 * 3. Handles selections of tokens
 * 4. Provides an API to make changes to tokens, while notifying listeners
 *    (e.g. {@link arethusa.core.state#methods_change state.change} and
 *    {@link arethusa.core.state#methods_watch state.watch})
 *
 * Reads its configuration from the `main` section.
 *
 * @requires arethusa.core.configurator
 * @requires arethusa.core.navigator
 * @requires $rootScope
 * @requires arethusa.core.documentStore
 * @requires arethusa.core.keyCapture
 * @requires arethusa.core.locator
 * @requires arethusa.core.StateChange
 * @requires arethusa.core.idHandler
 * @requires arethusa.core.globalSettings
 * @requires arethusa.util.logger
 */

angular.module('arethusa.core').service('state', [
  'configurator',
  'navigator',
  '$rootScope',
  'documentStore',
  'keyCapture',
  'locator',
  'StateChange',
  'idHandler',
  'globalSettings',
  'confirmationDialog',
  'notifier',
  'logger',
  function (configurator, navigator, $rootScope, documentStore, keyCapture,
            locator, StateChange, idHandler, globalSettings, confirmationDialog,
            notifier, logger) {
    var self = this;
    var tokenRetrievers;

    this.documents = function() {
      return documentStore.store;
    };

    function configure() {
      self.conf = configurator.configurationFor('main');
      tokenRetrievers = configurator.getRetrievers(self.conf.retrievers);

      // We start silent - during init we don't want to track events
      self.silent = true;

      // Listeners to changes might be interested in recording several
      // little changes as one single step. Plugins can look at this var
      // so that they can adjust accordingly.
      self.batchChange = false;

      // Cheap way of defining a debug mode
      self.debug = self.conf.debug;

      self.initServices();

      self.activeKeys = {};
      var keys = keyCapture.initCaptures(function(kC) {
        return {
          selections: [
            kC.create('nextToken', function() { kC.doRepeated(self.selectNextToken); }, 'w'),
            kC.create('prevToken', function() { kC.doRepeated(self.selectPrevToken); }, 'e'),
            kC.create('deselect', function() { self.deselectAll(); }, 'esc' )
          ]
        };
      });
      angular.extend(self.activeKeys, keys.selections);
    }

    // Exposed for easier testing
    this.initServices = function() {
      navigator.init();
      globalSettings.init();
    };

    // We hold tokens locally during retrieval phase.
    // Once we are done, they will be exposed through
    // this.replaceState, which also triggers
    // the stateLoaded event.
    var tokens = {};

    // Loading a state
    // Premature optimization - we need something like that only when we start
    // to act on several documents at once. For now we have only one retriever
    // anyway...
    //
    //var saveTokens = function (container, tokens) {
      //angular.forEach(tokens, function (token, id) {
        //var updatedToken;
        //var savedToken = container[id];
        //if (savedToken) {
          //updatedToken = angular.extend(savedToken, token);
        //} else {
          //updatedToken = token;
        //}
        //container[id] = token;
      //});
    //};

    function noRetrievers() {
      return Object.keys(tokenRetrievers).length === 0;
    }

    /**
     * @ngdoc function
     * @name arethusa.core.state#retrieveTokens
     * @methodOf arethusa.core.state
     *
     * @description
     * Tries to iterate over all available retrievers and gets documents
     * from them.
     *
     */
    this.retrieveTokens = function () {
      //var container = {};
      navigator.reset();
      self.deselectAll();

      if (noRetrievers()) {
        self.checkLoadStatus();
        return;
      }

      angular.forEach(tokenRetrievers, function (retriever, name) {
        retriever.get(function (data) {
          navigator.addSentences(data);
          moveToSentence();
          // Check comment for saveTokens
          //saveTokens(container, navigator.currentChunk());
          tokens = navigator.currentChunk();

          declarePreselections(retriever.preselections);
          declareLoaded(retriever);
        });
      });
      //tokens = container;
    };

    function getChunkParam() {
      var param = self.conf.chunkParam;
      if (param) return locator.get(param);
    }

    function moveToSentence() {
      var id = getChunkParam();
      if (id) {
        if (navigator.goTo(id)) {
          return;
        }
      }
      // If goTo failed, we just update the id with the starting value 0
      navigator.updateId();
    }

    this.checkLoadStatus = function () {
      var loaded = true;
      angular.forEach(tokenRetrievers, function (el, name) {
        loaded = loaded && el.loaded;
      });
      if (loaded) {
        var launch = function() { self.launched = true; self.replaceState(tokens, true); };

        if (documentStore.hasAdditionalConfs()) {
          // launch when the promise is resolved OR rejected
          configurator.loadAdditionalConf(documentStore.confs)['finally'](launch);
        } else {
          launch();
        }
      }
    };

    function declarePreselections(ids) {
      var chunkId = getChunkParam();
      if (chunkId) {
        var paddedIds = arethusaUtil.map(ids, function(id) {
          return idHandler.padIdWithSId(id, chunkId);
        });
        selectMultipleTokens(paddedIds);
      }
    }

    var declareLoaded = function (retriever) {
      retriever.loaded = true;
      self.checkLoadStatus();
    };

    // Delegators
    this.asString = function (id) {
      return self.tokens[id].string;
    };

    this.getToken = function (id) {
      return self.tokens[id] || {};
    };

    // Selections
    this.selectedTokens = {};
    this.clickedTokens  = {};

    this.hasSelections = function() {
      return Object.keys(self.selectedTokens).length !== 0;
    };

    this.hasClickSelections = function() {
      return Object.keys(self.clickedTokens).length;
    };

    this.isSelected = function(id) {
      return id in this.selectedTokens;
    };

    this.isClicked = function(id) {
      return id in this.clickedTokens;
    };

    // multi-selects tokens, given an array of ids
    this.multiSelect = function(ids) {
      self.deselectAll();
      selectMultipleTokens(ids);
    };

    function selectMultipleTokens(ids) {
      angular.forEach(ids, function (id, i) {
        self.selectToken(id, 'ctrl-click');
      });
    }


    // type should be either 'click', 'ctrl-click' or 'hover'
    this.selectToken = function (id, type, changeHead) {
      if (type === 'click') self.deselectAll();

      if (self.isSelectable(self.selectionType(id), type)) {
        self.selectedTokens[id] = type;
        if (type !== 'hover') {
          self.clickedTokens[id] = type;
        }
      }
    };

    this.selectionType = function (id) {
      return self.selectedTokens[id];
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
      if (self.selectionType(id) === type) {
        delete self.selectedTokens[id];
        delete self.clickedTokens[id];
      }
    };

    this.toggleSelection = function (id, type) {
      // only deselect when the selectionType is the same.
      // a hovered selection can still be selected by click.
      if (this.isSelected(id) && this.selectionType(id) == type) {
        this.deselectToken(id, type);
      } else {
        this.selectToken(id, type);
      }
    };

    this.deselectAll = function () {
      for (var el in self.selectedTokens) {
        delete self.selectedTokens[el];
        delete self.clickedTokens[el];
      }
    };

    this.firstSelected = function() {
      return Object.keys(self.selectedTokens)[0];
    };

    this.selectSurroundingToken = function (direction) {
      // take the first current selection
      var firstId = self.firstSelected();
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

    this.toTokenStrings = function(ids) {
      var nonSequentials = idHandler.nonSequentialIds(ids);
      var res = [];
      angular.forEach(ids, function(id, i) {
        res.push(self.asString(id));
        if (nonSequentials[i]) res.push('...');
      });
      return res.join(' ');
    };


    // DEPRECATED
    this.setState = function (id, category, val) {
      logger.log('state.setState is DEPRECATED. Use state.change() instead.');
      var token = self.tokens[id];
      // We're covering up for diffs - review is the only plugin still using
      // this - of artificialTokens, where ids might not match.
      if (!token) return;
      var oldVal = token[category];
      token[category] = val;
    };

    this.unsetState = function (id, category) {
      var token = self.tokens[id];
      var oldVal = token[category];
      delete token[category];
    };

    this.replaceState = function (tokens, keepSelections) {
      // We have to wrap this as there might be watchers on allLoaded,
      // such as the MainCtrl which has to reinit all plugins when the
      // state tokens are replaced
      if (!keepSelections) self.deselectAll();
      self.tokens = tokens;
      if (self.launched) self.broadcast('stateLoaded');
    };

    this.setStyle = function (id, style) {
      self.getToken(id).style = style;
    };

    this.addStyle = function(id, style) {
      var token = self.getToken(id);
      if (!token.style) {
        token.style = {};
      }
      angular.extend(token.style, style);
    };

    this.unapplyStylings = function() {
      angular.forEach(self.tokens, function(token, id) {
        self.unsetStyle(id);
      });
    };

    this.removeStyle = function(id, style) {
      var tokenStyle = self.getToken(id).style;
      if (! tokenStyle) return;

      var styles = arethusaUtil.toAry(style);
      angular.forEach(styles, function(style, i) {
        delete tokenStyle[style];
      });
    };

    this.unsetStyle = function (id) {
      self.getToken(id).style = {};
    };

    this.addStatusObjects = function () {
      angular.forEach(self.tokens, addStatus);
    };

    function addStatus(token) {
      if (! token.status) {
        token.status = {};
      }
    }

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

    this.addToken = function(token, id) {
      self.tokens[id] = token;
      addStatus(token);
      navigator.addToken(token);
      self.countTotalTokens();
      self.broadcast('tokenAdded', token);
    };

    this.removeToken = function(id) {
      var token = self.getToken(id);
      // We translate this a little later - waiting for a pending
      // change in the translator which allows to give context.
      var msg = 'Do you really want to remove ' + token.string + '?';
      confirmationDialog.ask(msg).then((function() {
        // broadcast before we actually delete, in case a plugin needs access
        // during the cleanup process
        self.doBatched(function() {
          self.broadcast('tokenRemoved', token);
          delete self.tokens[id];
        });
        navigator.removeToken(token);
        idHandler.unassignSourceId(token);
        notifier.success(token.string + ' removed!');
        self.deselectAll();
        self.countTotalTokens();
      }));
    };

    this.lazyChange = function(tokenOrId, property, newVal, undoFn, preExecFn) {
      return new StateChange(self, tokenOrId, property, newVal, undoFn, preExecFn);
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#change
     * @methodOf arethusa.core.state
     *
     * @description
     * Sets the property of a token to a new value.
     *
     * **ALWAYS** use this function when you want to make changes to a `token`.
     * While it is possible to access all properties of a `token` - and therefore
     * also the assign them to a new value - you should **NEVER** do this manually.
     *
     * By using this function you guarantee a proper event flow. The change itself
     * is done through an {@link arethusa.core.StateChange StateChange} object,
     * which notifies all listeners registered through {@link arethusa.core.state#methods_watch state.watch}
     * and also broadcasts a `tokenChange` event.
     *
     * Communicates with {@link arethusa.core.globalSettings#method_shouldDeselect globalSettings.shouldDeselect}
     * to determine whether all selections should be negated or not.
     *
     * @param {Token|String} tokenOrId Token or the id of a token to execute a
     *   change on
     * @param {String} property Path to the property which needs to be changed,
     *   e.g. `'head.id'`
     * @param {*} newVal The new value set during this change
     * @param {Function} [undoFn] Optional custom function to undo the change.
     *   Defaults to a simple inversion - i.e. setting the `property` back to
     *   the old value.
     * @param {Function} [preExecFn] Optional function to be executed right
     *   before a change is happening, i.e. the `property` is set to the `newVal`
     *   during the execution of {@link arethusa.core.StateChange StateChange}.exec
     *
     * @returns {StateChange} Returns a {@link arethusa.core.StateChange StateChange}
     *   event object
     *
     */
    this.change = function(tokenOrId, property, newVal, undoFn, preExecFn) {
      var event = self.lazyChange(tokenOrId, property, newVal, undoFn, preExecFn);
      if (globalSettings.shouldDeselect(property)) self.deselectAll();
      return event.exec();
    };

    this.notifyWatchers = function(event) {
      function execWatch(watch) { watch.exec(event.newVal, event.oldVal, event); }

      var watchers = changeWatchers[event.property] || [];

      angular.forEach(watchers, execWatch);
      angular.forEach(changeWatchers['*'], execWatch);
    };


    var changeWatchers = { '*' : [] };

    function EventWatch(event, fn, destroyFn, watchers) {
      var self = this;
      this.event = event;
      this.exec = fn;
      this.destroy = function() {
        if (destroyFn) destroyFn();
        watchers.splice(watchers.indexOf(self), 1);
      };
    }

    /**
     * @ngdoc function
     * @name arethusa.core.state#watch
     * @methodOf arethusa.core.state
     *
     * @description
     * Registers a `listener` callback executed whenever a
     * {@link arethusa.core.state#methods_change state.change} with a matching
     * event is called.
     *
     * @param {String} event Name of the change event to listen to - meant to
     *   be the path of a property on a token object (e.g. `'head.id'`).
     *
     *   The special param `'*'` can be passed to listen to all change events.
     *
     * @param {Function} fn Callback to be executed when a change has happened.
     *
     *   Three arguments are passed to this function
     *
     *   1. the new value
     *   2. the old value
     *   3. a {@link arethusa.core.StateChange StateChange} event object
     *
     * @param {Function} [destroyFn] Optional callback executed when the
     *   listener is deregistered.
     *
     * @returns {Function} Deregisters the listener when executed.
     *
     */
    this.watch = function(event, fn, destroyFn) {
      var watchers = changeWatchers[event];
      if (!watchers) watchers = changeWatchers[event] = [];
      var watch = new EventWatch(event, fn, destroyFn, watchers);
      watchers.push(watch);
      return watch.destroy;
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#on
     * @methodOf arethusa.core.state
     *
     * @description
     * Delegates to `$rootScope.$on`.
     *
     * @param {String} event The eventname
     * @param {Function} fn Callback function
     *
     */
    this.on = function(event, fn) {
      $rootScope.$on(event, fn);
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#broadcast
     * @methodOf arethusa.core.state
     *
     * @description
     * Delegates to `$rootScope.broadcast`.
     *
     * @param {String} event The eventname
     * @param {*} [arg] Optional argument transmitted alongside the event
     */
    this.broadcast = function(event, arg) {
      $rootScope.$broadcast(event, arg);
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#doSilent
     * @methodOf arethusa.core.state
     *
     * @description
     * Calls a function in `silent` mode. No events are broadcasted and no
     * listeners notified upon changes (typically firing through a call of
     * {@link arethusa.core.state#methods_change state.change}) made during it.
     *
     * @param {Function} fn Function to call during `silent` mode
     *
     */
    this.doSilent = function(fn) {
      self.silent = true;
      fn();
      self.silent = false;
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#doBatched
     * @methodOf arethusa.core.state
     *
     * @description
     * Calls a function in `batchChange` mode. All change events (typically
     * done through {@link arethusa.core.state#methods_change state.change}) firing
     * during this mode will be collected and broadcasted as a single event.
     *
     * This is especially helpful when we want to undo a multi-change action in
     * a single step.
     *
     * @param {Function} fn Function to call during `batchChange` mode
     *
     */
    this.doBatched = function(fn) {
      self.batchChangeStart();
      fn();
      self.batchChangeStop();
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#batchChangeStart
     * @methodOf arethusa.core.state
     *
     * @description
     * Activates `batchChange` mode.
     *
     * Typically called during the execution of {@link arethusa.core.state#methods_doBatched state.doBatched}.
     *
     */
    this.batchChangeStart = function() {
      self.batchChange = true;
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#batchChangeStop
     * @methodOf arethusa.core.state
     *
     * @description
     * Deactivates `batchChange` mode and broadcasts the `batchChangeStop` event.
     *
     * Typically called during the execution of {@link arethusa.core.state#methods_doBatched state.doBatched}.
     *
     */
    this.batchChangeStop = function() {
      self.batchChange = false;
      self.broadcast('batchChangeStop');
    };

    this.postInit = function () {
      self.addStatusObjects();
      self.countTotalTokens();
    };

    /**
     * @ngdoc function
     * @name arethusa.core.state#init
     * @methodOf arethusa.core.state
     *
     * @description
     * Configures the service and starts the document retrieval process.
     *
     */
    this.init = function () {
      configure();
      self.retrieveTokens();
    };
  }
]);
