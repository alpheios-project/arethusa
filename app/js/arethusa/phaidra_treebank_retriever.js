"use strict";

angular.module('arethusa').factory('PhaidraTreebankRetriever', [
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  'languageSettings',
  'locator',
  function(configurator, documentStore, retrieverHelper,
           idHandler, languageSettings, locator) {
    // Single sentence documents for now.
    function parseDocument(doc, docId) {
      var sId = '1';
      var tokens = {};

      var words = doc.words;

      for (var i=0; i < words.length; i++) {
        var word = words[i];
        var token = aC.token(word.value, sId);
        var intId = idHandler.getId(word.tbwid);
        retrieverHelper.generateId(token, intId, word.CTS, docId);

        var head = word.head;
        if (angular.isDefined(head)) {
          token.head = { id: idHandler.getId(head) };
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

      return [new aC.sentence(sId, tokens, doc.CTS)];
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
          documentStore.addDocument(docId, new aC.doc(null, data, null));
          languageSettings.setFor(docId, inferLanguage(data));
          callback(parseDocument(data, docId));
        });
      };
    };
  }
]);
