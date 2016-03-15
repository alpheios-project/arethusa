"use strict";

angular.module('arethusa').factory('PhaidraTreebankRetriever', [
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  'languageSettings',
  'locator',
  'commons',
  function(configurator, documentStore, retrieverHelper,
           idHandler, languageSettings, locator, commons) {
    // Single sentence documents for now.
    function parseDocument(doc, docId) {
      var sentenceId = '1';
      var tokens = {};

      var words = doc.words;

      for (var i=0; i < words.length; i++) {
        var word = words[i];
        var token = commons.token(word.value, sentenceId);
        var intId = idHandler.getId(word.tbwid, sentenceId);
        retrieverHelper.generateId(token, intId, word.CTS, docId);

        var head = word.head;
        if (angular.isDefined(head)) {
          token.head = { id: idHandler.getId(head, sentenceId) };
        }

        var relation = word.relation;
        if (relation) {
          token.relation = { label: relation };
        }

        token.morphology = {
          lemma: word.lemma,
          attributes: parseMorph(word)
        };

        tokens[token.id] = token;
      }

      var s = commons.sentence(tokens, doc.CTS);
      retrieverHelper.generateId(s, sentenceId, sentenceId, docId);
      return [s];
    }

    // This is a little ugly (and slow), as the morphology is just thrown
    // into the object.
    var morphKeys = {
      'pos': null,
      'person': 'pers',
      'number': 'num',
      'tense': null,
      'mood': null,
      'voice': null,
      'gender': 'gend',
      'case': null,
      'degree': null
    };

    function parseMorph(word) {
      var attrs = {}, key, attrKey, val;
      for (key in morphKeys) {
        attrKey = morphKeys[key] || key;
        val = word[key];
        if (val) attrs[attrKey] = val;
      }

      return attrs;
    }

    function inferLanguage(doc) {
      // For now we assume that all tokens have the same language
      return doc.words[0].lang;
    }

    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.preselections = retrieverHelper.getPreselections(conf);

      this.get = function(callback) {
        resource.get().then(function(res) {
          var data = res.data;
          documentStore.addDocument(docId, commons.doc(null, data, null));
          languageSettings.setFor(docId, inferLanguage(data));
          callback(parseDocument(data, docId));
        });
      };
    };
  }
]);
