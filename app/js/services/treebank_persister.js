'use strict';
/*
 *
 */
angular.module('arethusa').factory('TreebankPersister', [
  'documentStore',
  'configurator',
  'navigator',
  function (documentStore, configurator, navigator) {
    return function(conf) {
      var resource = configurator.provideResource(conf.resource);

      function updateXml() {
        var doc = documentStore.store.tbd; // placeholder
        doc.xml = arethusaUtil.json2xml(doc.json);
      }

      function updateDocument() {
        var doc = documentStore.store.tbd; // placeholder
        var stored = arethusaUtil.toAry(doc.json.treebank.sentence);
        // navigator has to provide means to retrieve sentences by id
        // and not only through a flat array!
        var sentences = navigator.sentences;

        angular.forEach(stored, function(sentence, i) {
          var updated = sentences[sentence._id - 1];
          angular.forEach(sentence.word, function(word, i) {
            var stateWord = updated.tokens[arethusaUtil.formatNumber(word._id, 4)];

            word._head = arethusaUtil.formatNumber(stateWord.head.id, 0);
            word._relation = stateWord.relation.label;
            word._lemma = stateWord.morphology.lemma;
            word._postag = stateWord.morphology.postag;
            word._form = stateWord.string;
          });
        });
      }

      this.saveData = function(callback) {
        updateDocument();
        updateXml();

        callback();
      };
    };
  }
]);

