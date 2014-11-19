"use strict";

angular.module('arethusa').factory('ConstituentTreebankRetriever', [
  'configurator',
  'documentStore',
  function(configurator, documentStore) {
    // Parse functions

    function parseDocument(json, docId) {
      return parseSentences(json.book.sentence, docId);
    }

    function parseSentences(sentences, docId) {
      return aU.toAry(sentences).map(function(sentence) {
        return parseSentence(sentence, docId);
      });
    }

    function parseSentence(sentence, docId) {
      var sentenceId = sentence._ID;
      var constituents = new Container();
      var tokens = new Container();

      // Hack to resolve the ambiguity between sentence and subject
      var wgNode = sentence.wg;
      wgNode._role = 'sent';

      parseWordGroup(wgNode, docId, sentenceId, constituents, tokens);

      return aC.sentence(sentenceId, tokens.container, constituents.container);
    }

    function parseWordGroup(wg, docId, sentenceId, constituents, tokens, parentId) {
      var id = wg._nodeId;
      var constituent = aC.constituent(
        wg._class,
        wg._role,
        id,
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
      var token = aC.token(w.__text, sentenceId);
      token.id = w._morphId;

      parseMorph(token, w);

      tokens.add(token);
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

    // Helpers

    function Container() {
      var self = this;
      this.container = {};
      this.add = function(el) {
        self.container[el.id] = el;
      };
    }

    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.parse = function(xml, callback) {
        var json = arethusaUtil.xml2json(xml);
        documentStore.addDocument(docId, new aC.doc(xml, json));

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
