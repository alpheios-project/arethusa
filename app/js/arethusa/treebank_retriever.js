'use strict';
/* A newable factory to handle xml files using the Perseus Treebank Schema
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa').factory('TreebankRetriever', [
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  'commons',
  'editors',
  function (configurator, documentStore, retrieverHelper,
            idHandler, commons, editors) {

    function parseDocument(json, docId) {
      var annotators = arethusaUtil.toAry(json.treebank.annotator || []);
      parseEditors(annotators, docId);
      var sentences = arethusaUtil.toAry(json.treebank.sentence);
      return parseSentences(sentences, docId);
    }

    function parseEditors(annotators, docId) {
      angular.forEach(annotators, function(annotator, i) {
        if (isHumanAnnotator(annotator)) {
          editors.addEditor(docId, {
            name: annotator.short,
            fullName: annotator.name,
            page: annotator.url,
            mail: annotator.address
          });
        }
      });
    }

    function parseSentences(sentences, docId) {
      return sentences.map(function(sentence) {
        var cite = extractCiteInfo(sentence);
        var words = arethusaUtil.toAry(sentence.word);
        return parseSentence(sentence, sentence._id, docId, cite);
      });
    }

    function parseSentence(sentence, id, docId, cite) {
      var words = aU.toAry(sentence.word);
      var tokens = {};

      var artificials = extractArtificials(words, id);

      var lastI = words.length - 1;
      angular.forEach(words, function (word, i) {
        var token = parseWord(word, id, docId, artificials);
        if (i === lastI) token.terminator = true;
        tokens[token.id] = token;
      });

      var sentenceObj = commons.sentence(tokens, cite);
      retrieverHelper.generateId(sentenceObj, id, id, docId);

      return sentenceObj;
    }

    function parseWord(word, sentenceId, docId, artificials) {
      // One could formalize this to real rules that are configurable...
      //
      // Remember that attributes of the converted xml are prefixed with underscore
      var token = commons.token(word._form, sentenceId);

      parseMorphology(token, word);
      parseRelation(token, word);
      parseSg(token, word);
      parseArtificial(token, word);
      parseHead(token, word, artificials);

      var internalId = generateInternalId(word, sentenceId);
      var sourceId   = word._id;
      retrieverHelper.generateId(token, internalId, sourceId, docId);

      return token;
    }

    function parseHead(token, word, artificials) {
      var headId = word._head;
      if (angular.isDefined(headId) && headId !== "") {
        var newHead = {};
        var artHeadId = artificials[headId];
        var sentenceId = token.sentenceId;
        newHead.id = artHeadId ? artHeadId : idHandler.getId(headId, sentenceId);

        token.head = newHead;
      }
    }


    function parseMorphology(token, word) {
      token.morphology = {
        lemma: word._lemma,
        postag: word._postag
      };

      var gloss = word._gloss;
      if (gloss) {
        token.morphology.gloss = gloss;
      }
    }

    function parseRelation(token, word) {
      var relation = word._relation;
      var label = (relation && relation !== 'nil') ? relation : '';

      token.relation = {
        label: label
      };
    }

    function parseSg(token, word) {
      var sg = word._sg;
      if (sg && !sg.match(/^\s*$/)) {
        token.sg = { ancestors: sg.split(' ') };
      }
    }

    function parseArtificial(token, word) {
      if (word._artificial) {
        token.artificial = true;
        token.type = word._artificial;
      }
    }


    // Helpers


    function extractArtificials(words, sentenceId) {
      return arethusaUtil.inject({}, words, function(memo, word, i) {
        extractArtificial(memo, word, sentenceId);
      });
    }

    function extractArtificial(memo, word, sentenceId) {
      if (word._artificial) {
        memo[word._id] = padWithSentenceId(word._insertion_id, sentenceId);
      }
    }

    function generateInternalId(word, sentenceId) {
      if (word._artificial) {
        return padWithSentenceId(word._insertion_id, sentenceId);
      } else {
        return idHandler.getId(word._id, sentenceId);
      }
    }

    // This is for backwards compatibility - we still might encounter documents, which
    // stored the insertion id without the sentence id. This is a little hacky but a
    // must have.
    function padWithSentenceId(id, sentenceId) {
      return (id.match(/-/)) ? id : idHandler.padIdWithSId(id, sentenceId);
    }

    // Try to support the new as well as the old schema for now
    function extractCiteInfo(sentence) {
      var cite = sentence._cite;
      if (cite) {
        return cite;
      } else {
        var docId = sentence._document_id;
        var subdoc = sentence._subdoc;
        if (subdoc) {
          return docId + ':' + subdoc;
        } else {
          return docId;
        }
      }
    }

    function findAdditionalConfInfo(json) {
      var linkInfo = json.treebank.link;
      var links =  linkInfo ? arethusaUtil.toAry(linkInfo) : [];
      var confs = arethusaUtil.inject({}, links, function(memo, link) {
        memo[link._title] = link._href;
      });
      var format = json.treebank._format;
      if (format) {
        // For backwards compatibility to older days
        if (format == 'aldt') {
          format = 'aldt2' + json.treebank['_xml:lang'];
        }
        confs.fullFile = format;
      }
      return confs;
    }

    function isHumanAnnotator(annotator) {
      // Machine services don't come with a name attached to them
      return annotator.name && annotator.short;
    }



    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.preselections = retrieverHelper.getPreselections(conf);

      this.parse = function(xml, callback) {
        var json = arethusaUtil.xml2json(xml);
        var moreConf = findAdditionalConfInfo(json);
        var doc = commons.doc(xml, json, moreConf);

        documentStore.addDocument(docId, doc);
        callback(parseDocument(json, docId));
      };

      // Called with either one, or two params
      this.get = function (params, callback) {
        if (!callback) {
          callback = params;
          params = {};
        }

        resource.get(params).then(function (res) {
          self.parse(res.data, callback);
        });
      };
    };
  }
]);
