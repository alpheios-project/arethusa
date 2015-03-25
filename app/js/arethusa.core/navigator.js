'use strict';
angular.module('arethusa.core').service('navigator', [
  '$injector',
  'configurator',
  '$cacheFactory',
  'keyCapture',
  '$rootScope',
  'globalSettings',
  function ($injector, configurator, $cacheFactory,
            keyCapture, $rootScope, globalSettings) {

    var MOVE_EVENT = 'navigator:move';
    var self = this;
    var citeMapper;
    var context = {};

    function layoutChunkSize() {
      var layoutConf = globalSettings.layout.navigator || {};
      return layoutConf.chunkSize;
    }
    function initChunkSize() {
      return layoutChunkSize() || self.conf.chunkSize || 1;
    }

    this.init = function() {
      self.conf = configurator.configurationFor('navigator');

      self.chunkModes = ['sentence'];
      self.chunkMode = self.conf.chunkMode || 'sentence';
      self.chunkSize = initChunkSize();

      self.sentences = [];
      self.sentencesById = {};
      //holds a pointer to the currently displayed chunk
      self.status = { context: context };
      updatePosition(0);

      citeMapper = configurator.provideResource('citeMapper');

      self.keys = keyCapture.initCaptures(function(kC) {
        return {
          navigation: [
            kC.create('nextChunk', function() { kC.doRepeated(self.nextChunk); }, 'u'),
            kC.create('prevChunk', function() { kC.doRepeated(self.prevChunk); }, 'i'),
            kC.create('list', function() { self.switchView(); }, 'L')
          ]
        };
      });

      navigator.chunkMode = 'sentence';

      $rootScope.$on('layoutChange', function(ev, layout) {
        self.changeChunkSize(initChunkSize());
      });
    };

    this.applyChunkMode = function() {
      // tbd - we only support sentences so far
    };

    this.changeChunkSize = function(size) {
      if (self.chunkSize === size) return;
      self.chunkSize = size;
      self.updateState();
    };


    this.state = function () {
      if (!self.lazyState) {
        self.lazyState = $injector.get('state');
      }
      return self.lazyState;
    };

    this.addSentences = function(sentences) {
      arethusaUtil.pushAll(self.sentences, sentences);
      angular.forEach(sentences, function(sentence, i) {
        self.sentencesById[sentence.id] = sentence;
      });
      updateChunks();
    };

    var currentIds = function () {
      return arethusaUtil.map(currentSentenceObjs(), 'id');
    };

    var currentSentenceObjs = function () {
      var pos = self.currentPosition;

      if (!self.currentSentences) {
        self.currentSentences = self.sentences.slice(pos, pos + self.chunkSize) || [];
      }
      return self.currentSentences;
    };

    var currentChunk;
    this.currentChunk = function () {
      if (!currentChunk) {
        currentChunk = {};
        var currSentences = currentSentenceObjs();
        for (var i=0; i < currSentences.length; i++) {
          angular.extend(currentChunk, currSentences[i].tokens);
        }
        updateContext();
      }
      return currentChunk;
    };

    this.nextChunk = function () {
      if (self.hasNext()) movePosition(1);
    };
    this.prevChunk = function () {
      if (self.hasPrev()) movePosition(-1);
    };

    this.hasNext = function() {
      return self.currentPosition + self.chunkSize < self.sentences.length;
    };
    this.hasPrev = function() {
      return self.currentPosition > 0;
    };

    this.goToFirst = function() {
      updatePosition(0);
      self.updateState();
    };

    function updatePosition(pos) {
      self.currentPosition = pos;
    }

    function updateChunks() {
      self.currentSentences = undefined;
      currentChunk = undefined;
      self.currentChunk();
    }

    function findSentence(id) {
      var res;
      for (var i = self.sentences.length - 1; i >= 0; i--){
        if (self.sentences[i].id === id) {
          res = self.sentences[i];
          break;
        }
      }
      return res;
    }

    this.goTo = function(id) {
      var s = findSentence(id);
      if (s) {
        var i = self.sentences.indexOf(s);
        updatePosition(i);
        self.updateState();
        return true;
      } else {
        // Not totally sure what we want to do here -
        //  maybe add a notification?

        /* global alert */

        alert('No sentence with id ' + id + ' found');
      }
    };

    this.goToByPosition = function(pos) {
      if (self.sentences.length > pos) {
        updatePosition(pos);
        self.updateState();
      }
    };

    this.goToLast = function() {
      updatePosition(self.sentences.length - self.chunkSize);
      self.updateState();
    };

    function updateCitation() {
      resetCitation();
      self.getCitation(currentSentenceObjs(), storeCitation);
    }

    function hasCtsUrn(cite) {
      // CTS urns might be prefixed with a uri
      // prefix and not appear at the beginng of the doc id
      return cite.match(/urn:cts/);
    }

    function parseCtsUrn(cite, callback) {
      var citation;
      var citeSplit = splitCiteString(cite);
      var doc = citeSplit[0];
      var sec = citeSplit[1];
      citation = citationCache.get(doc);
      if (! citation) {
        citeMapper.get({ cite: doc}).then(function(res) {
          citation = res.data;
          citationCache.put(doc, citation);
          callback(citationToString(citation, sec));
        });
      } else {
        callback(citationToString(citation, sec));
      }
    }

    var citationCache = $cacheFactory('citation', { number: 100 });
    this.getCitation = function(sentences, callback) {
      if (!citeMapper) return;
      var sentence = sentences[0];
      if (!sentence) return;

      var cite = sentence.cite;
      if (cite) {
        if (hasCtsUrn(cite)) {
          parseCtsUrn(cite, callback);
        } else {
          callback(cite);
        }
      }
    };

    function splitCiteString(cite) {
      var i = cite.lastIndexOf(':');
      return [cite.slice(0, i), cite.slice(i + 1)];
    }

    function resetCitation() {
      delete self.status.citation;
    }

    function storeCitation(citationString) {
      self.status.citation = citationString;
    }

    function citationToString(citation, sec) {
      return [citation.author, citation.work, sec].join(' ');
    }

    this.updateState = function() {
      self.updateId();
      triggerMoveEvent();
      self.state().replaceState(self.currentChunk());
    };

    function movePosition(steps) {
      var newPos = self.currentPosition + (steps * self.chunkSize);
      if (newPos < 0) newPos = 0;

      self.currentPosition = newPos;
      self.updateState();
    }

    function updateNextAndPrev() {
      self.status.hasNext = self.hasNext();
      self.status.hasPrev = self.hasPrev();
    }

    function getPreContext(index) {
      if (index !== 0) return self.sentences[index - 1];
    }

    function getPostContext(index) {
      if (index !== self.sentences.length - 1) return self.sentences[index + 1];
    }

    function updateContext() {
      var sentences = currentSentenceObjs();
      var firstSentence = sentences[0];
      var lastSentence  = sentences[sentences.length - 1];

      var firstIndex = self.sentences.indexOf(firstSentence);
      var lastIndex  = self.sentences.indexOf(lastSentence);

      // Probably make context size configurable
      context.pre = getPreContext(firstIndex);
      context.post = getPostContext(lastIndex);
    }

    this.updateId = function () {
      updateNextAndPrev();
      updateChunks();
      self.status.currentPos = self.currentPosition;
      self.status.currentIds = currentIds();
      updateCitation();
    };

    this.sentenceToString = function(sentence) {
      return arethusaUtil.inject([], sentence.tokens, function(memo, id, token) {
        memo.push(token.string);
      }).join(' ');
    };

    this.editor = function() {
      return angular.element(document.getElementById('arethusa-editor'));
    };

    this.list = function() {
      return angular.element(document.getElementById('arethusa-sentence-list'));
    };

    this.switchView = function() {
      $rootScope.$broadcast('viewModeSwitched');
      var editor = self.editor();
      var list   = self.list();
      if (self.listMode) {
        editor.removeClass('hide');
        list.addClass('hide');
        self.listMode = false;
      } else {
        editor.addClass('hide');
        list.removeClass('hide');
        self.listMode = true;
      }
    };

    function resetList() {
      self.hasList = false;
    }

    this.reset = function () {
      updatePosition(0);
      self.sentences = [];
      self.sentencesById = {};
      self.listMode = false;
      resetList();
      self.updateId();
    };

    this.addToken = function(token) {
      var sentenceId = token.sentenceId;
      var id  = token.id;
      self.sentencesById[sentenceId].tokens[id] = token;
    };

    this.removeToken = function(token) {
      var sentenceId = token.sentenceId;
      var id  = token.id;
      delete self.sentencesById[sentenceId].tokens[id];
    };

    this.markChunkChanged = function() {
      var currSents = currentSentenceObjs();
      for (var i = currSents.length - 1; i >= 0; i--){
        currSents[i].changed = true;
      }
    };

    this.onMove = onMove;

    function onMove(cb) {
      return $rootScope.$on(MOVE_EVENT, cb);
    }

    function triggerMoveEvent() {
      $rootScope.$broadcast(MOVE_EVENT);
    }


    // Probably could deregister/reregister that watch, but it doesn't hurt...
    $rootScope.$on('tokenChange',  self.markChunkChanged);
    $rootScope.$on('tokenAdded',   self.markChunkChanged);
    $rootScope.$on('tokenRemoved', self.markChunkChanged);
    $rootScope.$on('layoutChange', resetList);
  }
]);
