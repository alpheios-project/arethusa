'use strict';

angular.module('arethusa').factory('TreebankPersister', [
  'documentStore',
  'configurator',
  'navigator',
  'idHandler',
  function (documentStore, configurator, navigator, idHandler) {
    return function(conf) {
      var self = this;
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
          if (angular.isDefined(morph.lemma))  word._lemma = morph.lemma;
          if (angular.isDefined(morph.postag)) word._postag= morph.postag;
          if (angular.isDefined(morph.gloss))  word._gloss = morph.gloss;
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

        var comment = stateWord.comment;
        if (comment) {
          word._comment = stateWord.comment;
        }

        word._form = stateWord.string;
      }

      function ArtificialNode(id, insertionId, type) {
        this._id = id;

        // We have to strip the sentence id for now, as the insertionId
        // won't make it through Perseids validation process.
        // It won't affect the import, as we're catching such cases there
        // for backwards compatibility anyway.
        //
        // Mind that this is a temporal solution and tightly couples this
        // process to the current id formatting.
        this._insertion_id = insertionId.split('-')[1];
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
        // Formerly unmapped tokens are exposed through an array to allow
        // postprocessing on them (such as adding artificialToken information)
        lastId = wordsInXml[wordsInXml.length - 1]._id;

        var tokens = idHandler.transformToSourceIds(updated.tokens, identifier, idCreator);
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

        // tokens - the result of the id.Handler.transfomToSource call -
        // exposes all previously unmapped ids in an Array.
        // When artificialTokens were added during the last call of this function
        // and now, the unmapped Array will contain them - we have to add
        // the artificialToken information now to complete the insertion of such
        // new nodes in the XML document.
        // After they have been inserted once, they will already have their id
        // mapping, so an artificialToken can never end up in the unmapped Array
        // twice.
        angular.forEach(tokens.unmapped, function(token, i) {
          var internalId = token.id;
          var sourceId   = token.idMap.sourceId(identifier);
          var newWord = new ArtificialNode(sourceId, internalId);
          updateWord(newWord, token, fullMap);
          wordsInXml.push(newWord);
        });
        updated.changed = false;
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

      this.output = function(noFormat) {
        updateDocument();
        updateXml();
        var xml = doc().xml;
        return noFormat ? xml : aU.formatXml(xml);
      };

      this.saveData = function(callback, errCallback) {
        resource.save(self.output(true), self.mimeType).then(callback, errCallback);
      };

      this.identifier = identifier;
      this.mimeType = 'text/xml';
      this.fileType = 'xml';
    };
  }
]);

