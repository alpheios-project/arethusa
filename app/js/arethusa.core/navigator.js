'use strict';
angular.module('arethusa.core').service('navigator', [
  '$injector',
  'configurator',
  '$cacheFactory',
  'keyCapture',
  '$rootScope',
  function ($injector, configurator, $cacheFactory, keyCapture, $rootScope) {
    var self = this;
    this.sentences = [];
    this.sentencesById = {};
    this.currentPosition = 0;
    this.status = {};

    var citeMapper = configurator.provideResource('citeMapper');

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
    };

    var currentId = function () {
      return currentSentenceObj().id;
    };
    var currentSentenceObj = function () {
      return self.sentences[self.currentPosition] || {};
    };
    this.currentSentence = function () {
      return currentSentenceObj().tokens;
    };

    this.nextSentence = function () {
      if (self.hasNext()) movePosition(1);
    };
    this.prevSentence = function () {
      if (self.hasPrev()) movePosition(-1);
    };

    this.hasNext = function() {
      return self.currentPosition < self.sentences.length - 1;
    };
    this.hasPrev = function() {
      return self.currentPosition > 0;
    };

    this.goToFirst = function() {
      self.currentPosition = 0;
      self.updateState();
    };

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
        self.currentPosition = i;
        self.updateState();
        return true;
      } else {
        // Not totally sure what we want to do here -
        //  maybe add a notification?

        /* global alert */

        alert('No sentence with id ' + id + ' found');
      }
    };

    this.goToLast = function() {
      self.currentPosition = self.sentences.length - 1;
      self.updateState();
    };

    function updateCitation() {
      resetCitation();
      self.getCitation(currentSentenceObj(), storeCitation);
    }

    var citationCache = $cacheFactory('citation', { number: 100 });
    this.getCitation = function(sentence, callback) {
      if (!citeMapper) return;

      var citation;
      var cite = sentence.cite;
      if (cite) {
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
      self.state().replaceState(self.currentSentence());
      self.updateId();
    };

    function movePosition(steps) {
      self.currentPosition += steps;
      self.updateState();
    }

    function updateNextAndPrev() {
      self.status.hasNext = self.hasNext();
      self.status.hasPrev = self.hasPrev();
    }

    this.updateId = function () {
      self.status.currentId = currentId();
      updateNextAndPrev();
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

    this.reset = function () {
      self.currentPosition = 0;
      self.sentences = [];
      self.sentencesById = {};
      self.listMode = false;
      self.hasList  = false;
      self.updateId();
    };

    keyCapture.initCaptures(function(kC) {
      return {
        navigation: [
          kC.create('nextSentence', function() { kC.doRepeated(self.nextSentence); }),
          kC.create('prevSentence', function() { kC.doRepeated(self.prevSentence); }),
          kC.create('list', function() { self.switchView(); })
        ]
      };
    });

    $rootScope.$on('tokenChange', function(event, change) {
      currentSentenceObj().changed = true;
    });
  }
]);
