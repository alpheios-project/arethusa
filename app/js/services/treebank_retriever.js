"use strict";

angular.module('arethusa').factory('treebankRetriever', function($http) {
  // tokens should always be loaded synchronous - the app should
  // not start anything without knowing an initial state

  var formatId = function(id) {
    return arethusaUtil.formatNumber(id, 4);
  };

  var xmlToState = function(token) {
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

  var parseXml = function(data) {
    var tokens = {};
    var xml = arethusaUtil.xml2json(data);
    var words = xml.treebank.sentence.word;
    angular.forEach(words, function(xmlToken, i) {
      var token = xmlToState(xmlToken);
      tokens[token.id] = token;
    });
    return tokens;
  };

  return {
    getData: function(url, callback) {
      $http.get(url).then(function(res) {
        callback(parseXml(res.data));
      });
    }
  };
});
