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
  'idHandler',
  'locator',
  function (configurator, documentStore, idHandler, locator) {
    function xmlTokenToState(docIdentifier, token, sentenceId, artificials) {
      // One could formalize this to real rules that are configurable...
      //
      // Remember that attributes of the converted xml are prefixed with underscore
      var obj = {
        sentenceId: sentenceId,
        string: token._form,
        morphology: {
          lemma: token._lemma,
          postag: token._postag
        },
        relation: {}
      };

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

      createId(obj, token, docIdentifier);
      createHead(obj, token, artificials);

      return obj;
    }

    function createId(stateToken, xmlToken, docIdentifier) {
      var idMap = new idHandler.Map();
      var internalId = xmlTokenId(xmlToken);
      var sourceId   = xmlToken._id;
      idMap.add(docIdentifier, internalId, sourceId);
      stateToken.id = internalId;
      stateToken.idMap = idMap;
    }

    function createHead(stateToken, xmlToken, artificials) {
      var head = xmlToken._head;
      if (angular.isDefined(head)) {
        var newHead = {};
        var artHead = artificials[head];
        newHead.id = artHead ? artHead : idHandler.getId(head);
        stateToken.head = newHead;
      }
    }

    function xmlTokenId(token) {
      return token._artificial ? token._insertion_id : idHandler.getId(token._id);
    }

    function extractArtificial(memo, token, i) {
      if (token._artificial) {
        memo[token._id] = token._insertion_id;
      }
    }

    function xmlSentenceToState(docIdentifier, words, id, cite) {
      var tokens = {};
      var artificials = arethusaUtil.inject({}, words, extractArtificial);
      angular.forEach(words, function (xmlToken, i) {
        var token = xmlTokenToState(docIdentifier, xmlToken, id, artificials);
        tokens[token.id] = token;
      });
      return {
        id: id,
        tokens: tokens,
        cite: cite
      };
    }

    function parseDocument(json, docIdentifier) {
      var sentences = arethusaUtil.toAry(json.treebank.sentence);
      return arethusaUtil.inject([], sentences, function (memo, sentence, k) {
        var cite = extractCiteInfo(sentence);
        memo.push(xmlSentenceToState(docIdentifier, sentence.word, sentence._id, cite));
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

    function parsePreselections(selector) {
      // after #191 is merged, also allow range strings here
      var preselections = arethusaUtil.toAry(locator.get(selector));
      return arethusaUtil.map(preselections, function(id) {
        return idHandler.getId(id);
      });
    }

    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docIdentifier = conf.docIdentifier;

      this.preselections = parsePreselections(conf.preselector);

      this.get = function (callback) {
        resource.get().then(function (res) {
          var xml = res.data;
          var json = arethusaUtil.xml2json(res.data);
          var moreConf = findAdditionalConfInfo(json);

          documentStore.addDocument(docIdentifier, new aC.doc(xml, json, moreConf));
          callback(parseDocument(json, docIdentifier));
        });
      };
    };
  }
]);
