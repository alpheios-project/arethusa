"use strict";

angular.module('arethusa').factory('treebankRetriever', function($http, navigator, resource) {
  // tokens should always be loaded synchronous - the app should
  // not start anything without knowing an initial state

  var formatId = function(id) {
    return arethusaUtil.formatNumber(id, 4);
  };

  var xmlTokenToState = function(token) {
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
      relation: {
        label: token._relation
      },
      head: {
        id: formatId(token._head)
      }
    };
  };

  var xmlSentenceToState = function(words, id) {
    var tokens = {};
    angular.forEach(words, function(xmlToken, i) {
      var token = xmlTokenToState(xmlToken);
      tokens[token.id] = token;
    });
    return { id: id, tokens: tokens};
  };

  var parseXml = function(data) {
    var xml = arethusaUtil.xml2json(data);
    var sentences = arethusaUtil.toAry(xml.treebank.sentence);
    navigator.reset();
    angular.forEach(sentences, function(sentence, key) {
      var stateObj = xmlSentenceToState(sentence.word, sentence._id);
      navigator.sentences.push(stateObj);
    });
    navigator.updateId();
    return navigator.currentSentence();
  };

  return {
    getData: function(callback) {
      resource.get().then(function(res) {
        callback(parseXml(res.data));
      });
    }
  };
});
