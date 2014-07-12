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

      function extractTokens(paragraph) {
        var tokens = {};

        angular.forEach(arethusaUtil.toAry(paragraph.sentence), function(sentence, i) {
          angular.forEach(arethusaUtil.toAry(sentence.token), function(token, otherI) {
            var id = token._id;
            var string = token._surface;
            tokens[id] = {
              id: id,
              string: string
            };
          });
        });

        return tokens;

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

