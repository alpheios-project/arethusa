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

      function updateWord(word, stateWord, fullMap) {
        // This whole function is horrificly ugly and could be refactored
        // to use more function calls - but this is not done on purpose.
        //
        // We want saving to be as fast as possible and avoid more calls.
        //
        // The if/else dancing is used to determine whether we should write
        // to the document or not.
        //
        // We write
        // - when a value is set in the current state
        // - when no value is set in the current state, but present in the
        //   source document (i.e.: user has unannotated on purpose
        //
        // We don't write
        // - when no value is present in state or document

        var head = stateWord.head;
        if ((head && head.id)) {
          // If the token has a head and it's not inside the full map,
          // it's the root token.
          word._head = fullMap[head.id] || 0;
        } else {
          // react against 0 values in head
          if (angular.isDefined(word._head)) word._head = '';
        }

        var relation = stateWord.relation;
        if (relation) {
          word._relation = relation.label;
        } else {
          if (word._relation) word._relation = '';
        }

        var morph = stateWord.morphology;
        if (morph) {
          word._lemma = morph.lemma;
          word._postag = morph.postag;
          if (angular.isDefined(morph.gloss)) word._gloss = morph.gloss;
        } else {
          if (word._lemma || word._postag) {
            word._lemma = word._postag = '';
          }
        }

        var sg = stateWord.sg;
        if (sg) {
          word._sg = arethusaUtil.map(sg.ancestors, function(el) {
            return el.short;
          }).join(' ');
        } else {
          if (word._sg) word._sg = '';
        }

        word._form = stateWord.string;
      }

      function ArtificialNode(id, insertionId, type) {
        this._id = id;
        this._insertion_id = insertionId;
        this._artificial = type || 'elliptic';
      }

      var lastId;
      function idCreator() {
        lastId++;
        return lastId;
      }

      function updateSentence(sentences, sentence) {
        var updated = sentences[sentence._id];

        // Check for changes - we might have nothing to do.
        if (!updated.changed) return;

        var wordsInXml = arethusaUtil.toAry(sentence.word);
        // We create a new object that holds all tokens of a sentence,
        // identified by their mappings in the original document.
        // Unmapped tokens are exposed through an array and will receive
        // mapped ids later
        lastId = wordsInXml[wordsInXml.length - 1]._id;

        var tokens = idHandler.transformToSoureIds(updated.tokens, identifier, idCreator);
        var withMappings = tokens.mapped;
        var fullMap = tokens.fullMap;
        var toDelete = [];
        angular.forEach(wordsInXml, function(word, i) {
          var stateWord = withMappings[word._id];
          if (stateWord) {
            updateWord(word, stateWord, fullMap);
          } else {
            toDelete.unshift(i); // unshift, because we want reverse order
          }
        });

        angular.forEach(toDelete, function(index, i) {
          wordsInXml.splice(index, 1);
        });

        // Usually, updatedTokens will be empty by now - it won't be
        // if artificialTokens were added during the annotation. New
        // word nodes needs to be inserted in the document now.
        angular.forEach(tokens.unmapped, function(token, i) {
          var internalId = token.id;
          var sourceId   = token.idMap.sourceId(identifier);
          var newWord = new ArtificialNode(sourceId, internalId);
          updateWord(newWord, token, fullMap);
          wordsInXml.push(newWord);
          // update the formerly unmapped token
          token.idMap.add(identifier, internalId, lastId);
        });
      }

      function updateDocument() {
        var stored = arethusaUtil.toAry(doc().json.treebank.sentence);
        // navigator has to provide means to retrieve sentences by id
        // and not only through a flat array!
        var sentences = navigator.sentencesById;

        angular.forEach(stored, function(sentence, i) {
          updateSentence(sentences, sentence);
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

