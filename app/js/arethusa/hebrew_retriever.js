"use strict";

angular.module('arethusa').factory('HebrewRetriever', [
  'documentStore',
  'configurator',
  'idHandler',
  'languageSettings',
  function (documentStore, configurator, idHandler, languageSettings) {
    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docIdentifier = conf.docIdentifier;

      function Token(id, string, terminator) {
        this.id = id;
        this.string = string;
        this.terminator = terminator;
      }

      function extractTokens(paragraph) {
        var result = {};

        angular.forEach(arethusaUtil.toAry(paragraph.sentence), function(sentence, i) {
          var tokens = arethusaUtil.toAry(sentence.token);
          var lastTokenI = tokens.length - 1;
          angular.forEach(tokens, function(token, otherI) {
            var id = token._id;
            var string = token._surface;
            var term = otherI === lastTokenI;
            result[id] = new Token(id, string, term);
          });
        });

        return result;
      }

      function parseDocument(doc, identifier) {
        var paragraphs = arethusaUtil.toAry(doc.corpus.article.paragraph);
        return arethusaUtil.map(paragraphs, function(p) {
          var id = p._id;
          var tokens = extractTokens(p);
          return {
            id: id,
            tokens: tokens,
          };
        });

      }

      this.getData = function (callback) {
        languageSettings.setFor(docIdentifier, 'heb');
        resource.get().then(function (res) {
          var xml = res.data;
          var json = arethusaUtil.xml2json(res.data);
          documentStore.addDocument(docIdentifier, {
            json: json,
            xml: xml
          });
          callback(parseDocument(json, docIdentifier));
        });
      };
    };
  }
]);

