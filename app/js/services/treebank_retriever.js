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
  function (documentStore, configurator) {
    function formatId(id) {
      return arethusaUtil.formatNumber(id, 4);
    }
    function xmlTokenToState(token) {
      // One could formalize this to real rules that are configurable...
      //
      // Remember that attributes of the converted xml are prefixed with underscore
      return {
        id: formatId(token._id),
        string: token._form,
        morphology: {
          lemma: token._lemma,
          postag: token._postag
        },
        relation: { label: token._relation },
        head: { id: formatId(token._head) }
      };
    }
    function xmlSentenceToState(words, id) {
      var tokens = {};
      angular.forEach(words, function (xmlToken, i) {
        var token = xmlTokenToState(xmlToken);
        tokens[token.id] = token;
      });
      return {
        id: id,
        tokens: tokens
      };
    }
    function parseXml(data) {
      var xml = arethusaUtil.xml2json(data);
      var sentences = arethusaUtil.toAry(xml.treebank.sentence);
      return arethusaUtil.inject([], sentences, function (memo, sentence, k) {
        memo.push(xmlSentenceToState(sentence.word, sentence._id));
      });
    }
    return function (conf) {
      var resource = configurator.provideResource(conf.resource);
      this.getData = function (callback) {
        resource.get().then(function (res) {
          var xml = res.data;
          documentStore.addDocument(res.source, xml);
          callback(parseXml(xml));
        });
      };
    };
  }
]);