'use strict';
/* A newable factory to handle xml files using the Perseus Treebank Schema
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa').factory('TreebankRetriever', [
  'documentStore',
  'configurator',
  '$location',
  'idHandler',
  function (documentStore, configurator, $location, idHandler) {
    function xmlTokenToState(token, sentenceId) {
      // One could formalize this to real rules that are configurable...
      //
      // Remember that attributes of the converted xml are prefixed with underscore
      var obj = {
        id: idHandler.getId(token._id),
        sentenceId: sentenceId,
        string: token._form,
        morphology: {
          lemma: token._lemma,
          postag: token._postag
        },
        relation: { label: token._relation },
        head: { id: idHandler.getId(token._head) },
      };

      if (token._sg) {
        obj.sg = { ancestors: token._sg.split(' ') };
      }

      return obj;
    }
    function xmlSentenceToState(words, id, cite) {
      var tokens = {};
      angular.forEach(words, function (xmlToken, i) {
        var token = xmlTokenToState(xmlToken, id);
        tokens[token.id] = token;
      });
      return {
        id: id,
        tokens: tokens,
        cite: cite
      };
    }
    function parseDocument(json) {
      var sentences = arethusaUtil.toAry(json.treebank.sentence);
      return arethusaUtil.inject([], sentences, function (memo, sentence, k) {
        var cite = extractCiteInfo(sentence);
        memo.push(xmlSentenceToState(sentence.word, sentence._id, cite));
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
      return arethusaUtil.inject({}, links, function(memo, link) {
        memo[link._title] = link._href;
      });
    }

    function parsePreselections(selector) {
      // after #191 is merged, also allow range strings here
      var preselections = arethusaUtil.toAry($location.search()[selector]);
      return arethusaUtil.map(preselections, function(id) {
        return idHandler.getId(id);
      });
    }

    return function (conf) {
      var resource = configurator.provideResource(conf.resource);

      this.preselections = parsePreselections(conf.preselector);
      this.getData = function (callback) {
        resource.get().then(function (res) {
          var xml = res.data;
          var json = arethusaUtil.xml2json(res.data);
          var moreConf = findAdditionalConfInfo(json);
          documentStore.addDocument(conf.docIdentifier, {
            json: json,
            xml: xml,
            conf: moreConf
          });
          callback(parseDocument(json));
        });
      };
    };
  }
]);
