"use strict";

angular.module('arethusa').factory('ConstituentTreebankRetriever', [
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  'globalStore',
  'commons',
  function(configurator, documentStore, retrieverHelper, idHandler,
           globalStore, commons) {
    // Parse functions

    function parseDocument(json, docId) {
      resetSentenceIdCounter();
      setUpConstituents();
      var constituents = new Container();
      var sentences = parseSentences(json.book.sentence, constituents, docId);
      angular.extend(globalStore.constituents, constituents.container);
      return sentences;
    }

    function parseSentences(sentences, constituents, docId) {
      return aU.toAry(sentences).map(function(sentence) {
        return parseSentence(sentence, constituents, docId);
      });
    }

    function parseSentence(sentence, constituents, docId) {
      var sourceId = sentence._ID;
      var internalId = getSentenceId();
      var tokens = new Container();

      // Hack to resolve the ambiguity between sentence and subject
      var wgNode = sentence.wg;
      wgNode._role = 'sent';

      parseWordGroup(wgNode, docId, internalId, constituents, tokens);

      var s = commons.sentence(tokens.container);
      var ids = Object.keys(s.tokens).sort();
      s.tokens[ids[ids.length - 1]].terminator = true;
      retrieverHelper.generateId(s, internalId, sourceId, docId);
      return s;
    }

    function parseWordGroup(wg, docId, sentenceId, constituents, tokens, parentId) {
      var id = wg._nodeId;
      var constituent = commons.constituent(
        wg._class,
        wg._role,
        id,
        sentenceId,
        parentId
      );

      constituents.add(constituent);

      angular.forEach(aU.toAry(wg.wg), function(childWg, i) {
        parseWordGroup(childWg, docId, sentenceId, constituents, tokens, id);
      });

      angular.forEach(aU.toAry(wg.w), function(w, i) {
        parseWord(w, docId, sentenceId, tokens, id);
      });

    }

    function parseWord(w, docId, sentenceId, tokens, parentId) {
      var token = commons.token(w.__text, sentenceId);

      var sourceId = w._morphId;
      var internalId = idHandler.getId(getWordId(sourceId), sentenceId);
      retrieverHelper.generateId(token, internalId, sourceId, docId);

      parseMorph(token, w);
      addConstituent(token, w, parentId);

      tokens.add(token);
    }

    function parseMorph(token, w) {
      var attrs = {}, key, expandedKey,  attrKey, val;
      for (key in morphKeys) {
        attrKey = morphKeys[key] || key;
        val = w['_' + key];
        if (val) attrs[attrKey] = val;
      }

      token.morphology = {
        lemma: w._lemma,
        attributes: attrs
      };
    }

    function addConstituent(token, w, parentId) {
      token.constituency = {
        parent: parentId,
        role: w._role
      };
    }

    // Helpers

    function Container() {
      var self = this;
      this.container = {};
      this.add = function(el) {
        self.container[el.id] = el;
      };
    }

    function setUpConstituents() {
      if (!globalStore.constituents) globalStore.constituents = {};
    }

    var morphKeys = {
      'class': 'pos',
      'person': 'pers',
      'number': 'num',
      'tense': null,
      'mood': null,
      'voice': null,
      'gender': 'gend',
      'case': null,
      'degree': null
    };

    var sIdCounter;
    function resetSentenceIdCounter() { sIdCounter = 0; }
    function getSentenceId() { sIdCounter += 1; return sIdCounter; }

    function getWordId(source) {
      return source.substr(source.length - 3);
    }


    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.parse = function(xml, callback) {
        var json = arethusaUtil.xml2json(xml);
        documentStore.addDocument(docId, commons.doc(xml, json));

        callback(parseDocument(json, docId));
      };

      this.get = function(callback) {
        resource.get().then(function(res) {
          var data = res.data;
          self.parse(res.data, callback);
        });
      };
    };
  }
]);
