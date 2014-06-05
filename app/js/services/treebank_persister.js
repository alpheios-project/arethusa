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

      function updateWord(word, stateWord) {
            word._head = arethusaUtil.formatNumber(stateWord.head.id, 0);
            word._relation = stateWord.relation.label;
            word._lemma = stateWord.morphology.lemma;
            word._postag = stateWord.morphology.postag;
            word._form = stateWord.string;
      }

      function updateDocument() {
        var doc = documentStore.store.tbd; // placeholder
        var stored = arethusaUtil.toAry(doc.json.treebank.sentence);
        // navigator has to provide means to retrieve sentences by id
        // and not only through a flat array!
        var sentences = navigator.sentences;
        console.log(sentences);

        angular.forEach(stored, function(sentence, i) {
          console.log(sentence._id);
          var updated = sentences[sentence._id - 1];
          angular.forEach(sentence.word, function(word, i) {
            var stateWord = updated.tokens[arethusaUtil.formatNumber(word._id, 4)];
            updateWord(word, stateWord);
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

