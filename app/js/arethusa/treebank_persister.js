'use strict';

angular.module('arethusa').factory('TreebankPersister', [
  'documentStore',
  'configurator',
  'navigator',
  'idHandler',
  function (documentStore, configurator, navigator, idHandler) {
    return function(conf) {
      var resource = configurator.provideResource(conf.resource);
      var identifier = conf.docIdentifier;

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
          // We create a new object that holds all tokens of a sentence,
          // identified by their mappings in the original document.
          // Unmapped tokens are exposed through an array and will receive
          // mapped ids later
          var tokens = idHandler.transformToSoureIds(updated.tokens, identifier);
          var withMappings = tokens.mapped;
          angular.forEach(wordsInXml, function(word, i) {
            var stateWord = withMappings[word._id];
            updateWord(word, stateWord);
          });

          // Usually, updatedTokens will be empty by now - it won't be
          // if artificialTokens were added during the annotation. New
          // word nodes needs to be inserted in the document now.
          var lastId = wordsInXml[wordsInXml.length - 1]._id;
          angular.forEach(tokens.unmapped, function(token, i) {
            var internalId = token.id;
            lastId++;
            var newWord = new ArtificialNode(lastId, internalId);
            updateWord(newWord, token);
            wordsInXml.push(newWord);
            // update the formerly unmapped token
            token.idMap.add(identifier, internalId, lastId);
          });
        });
      }

      function doc() {
        return documentStore.store[identifier];
      }

      this.saveData = function(callback, errCallback) {
        updateDocument();
        updateXml();
        resource.save(doc().xml,'text/xml').then(callback, errCallback);
      };
    };
  }
]);

