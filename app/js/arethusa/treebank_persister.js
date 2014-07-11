'use strict';

angular.module('arethusa').factory('TreebankPersister', [
  'documentStore',
  'configurator',
  'navigator',
  'idHandler',
  function (documentStore, configurator, navigator, idHandler) {
    return function(conf) {
      var resource = configurator.provideResource(conf.resource);

      function updateXml() {
        doc().xml = arethusaUtil.json2xml(doc().json);
      }

      function updateWord(word, stateWord) {
        if (stateWord.head && stateWord.head.id) {
          word._head = arethusaUtil.formatNumber(stateWord.head.id, 0);
        }
        if (stateWord.relation) {
          word._relation = stateWord.relation.label;
        }
        if (stateWord.morphology) {
          word._lemma = stateWord.morphology.lemma;
          word._postag = stateWord.morphology.postag;
        }
        if (stateWord.sg) {
          word._sg = arethusaUtil.map(stateWord.sg.ancestors, function(el) {
            return el.short;
          }).join(' ');
        }
        word._form = stateWord.string;
      }

      function ArtificialNode(id, insertionId, type) {
        this._id = id;
        this._insertion_id = insertionId;
        this._artificial = type || 'elliptic';
      }

      function updateDocument() {
        var stored = arethusaUtil.toAry(doc().json.treebank.sentence);
        // navigator has to provide means to retrieve sentences by id
        // and not only through a flat array!
        var sentences = navigator.sentencesById;

        angular.forEach(stored, function(sentence, i) {
          var updated = sentences[sentence._id];
          var wordsInXml = sentence.word;
          // We create a new object that holds all tokens of a sentence
          var updatedTokens = angular.extend({}, updated.tokens);
          angular.forEach(wordsInXml, function(word, i) {
            var id = idHandler.getId(word._id);
            var stateWord = updatedTokens[id];
            updateWord(word, stateWord);
            // After we updated a word, we delete it from our new object
            delete updatedTokens[id];
          });

          // Usually, updatedTokens will be empty by now - it won't be
          // if artificialTokens were added during the annotation. New
          // word nodes needs to be inserted in the document now.
          var lastId = wordsInXml[wordsInXml.length - 1]._id;
          angular.forEach(updatedTokens, function(word, realId) {
            lastId++;
            var newWord = new ArtificialNode(lastId, realId);
            updateWord(newWord, word);
            wordsInXml.push(newWord);
          });
        });
      }

      function doc() {
        return documentStore.store[conf.docIdentifier];
      }

      this.saveData = function(callback, errCallback) {
        updateDocument();
        updateXml();
        resource.save(doc().xml,'text/xml').then(callback, errCallback);
      };
    };
  }
]);

