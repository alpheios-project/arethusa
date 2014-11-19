'use strict';
/* A newable factory to handle xml files using the Perseus Treebank Schema
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa').factory('TreebankRetriever', [
  'commons',
  'configurator',
  'documentStore',
  'retrieverHelper',
  'idHandler',
  function (commons, configurator, documentStore, retrieverHelper, idHandler) {
    function xmlTokenToState(docId, token, sentenceId, artificials) {
      // One could formalize this to real rules that are configurable...
      //
      // Remember that attributes of the converted xml are prefixed with underscore
      var obj = commons.token(token._form, sentenceId);

      obj.morphology = {
        lemma: token._lemma,
        postag: token._postag
      };

      obj.relation = {};

      var relation = token._relation;
      obj.relation.label = (relation && relation !== 'nil') ? relation : '';

      var gloss = token._gloss;
      if (gloss) {
        obj.morphology.gloss = gloss;
      }

      var sg = token._sg;
      if (sg && !sg.match(/^\s*$/)) {
        obj.sg = { ancestors: sg.split(' ') };
      }

      if (token._artificial) {
        obj.artificial = true;
        obj.type = token._artificial;
      }

      if (aU.isTerminatingPunctuation(obj.string)) {
        obj.terminator = true;
      }

      var intId = xmlTokenId(token, sentenceId);
      retrieverHelper.generateId(obj, intId, token._id, docId);
      createHead(obj, token, artificials);

      return obj;
    }

    function createHead(stateToken, xmlToken, artificials) {
      var head = xmlToken._head;
      if (angular.isDefined(head) && head !== "") {
        var newHead = {};
        var artHead = artificials[head];
        newHead.id = artHead ? artHead : idHandler.getId(head, stateToken.sentenceId);
        stateToken.head = newHead;
      }
    }

    function xmlTokenId(token, sentenceId) {
      if (token._artificial) {
        return padWithSentenceId(token._insertion_id, sentenceId);
      } else {
        return idHandler.getId(token._id, sentenceId);
      }
    }

    // This is for backwards compatibility - we still might encounter documents, which
    // stored the insertion id without the sentence id. This is a little hacky but a
    // must have.
    function padWithSentenceId(id, sentenceId) {
      return (id.match(/-/)) ? id : idHandler.padIdWithSId(id, sentenceId);
    }

    function extractArtificial(memo, token, sentenceId) {
      if (token._artificial) {
        memo[token._id] = padWithSentenceId(token._insertion_id, sentenceId);
      }
    }

    function xmlSentenceToState(docId, words, id, cite) {
      var tokens = {};
      var artificials = arethusaUtil.inject({}, words, function(memo, token, i) {
        extractArtificial(memo, token, id);
      });
      angular.forEach(words, function (xmlToken, i) {
        var token = xmlTokenToState(docId, xmlToken, id, artificials);
        tokens[token.id] = token;
      });

      return commons.sentence(id, tokens, {}, cite);
    }

    function parseDocument(json, docId) {
      var sentences = arethusaUtil.toAry(json.treebank.sentence);
      return arethusaUtil.inject([], sentences, function (memo, sentence, k) {
        var cite = extractCiteInfo(sentence);
        var words = arethusaUtil.toAry(sentence.word);
        memo.push(xmlSentenceToState(docId, words, sentence._id, cite));
      });
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



    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.preselections = retrieverHelper.getPreselections(conf);

      this.parse = function(xml, callback) {
        var json = arethusaUtil.xml2json(xml);
        var moreConf = findAdditionalConfInfo(json);

        documentStore.addDocument(docId, new commons.doc(xml, json, moreConf));
        callback(parseDocument(json, docId));
      };

      this.get = function (callback) {
        resource.get().then(function (res) {
          self.parse(res.data, callback);
        });
      };
    };
  }
]);
