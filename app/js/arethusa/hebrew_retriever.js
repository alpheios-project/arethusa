"use strict";

angular.module('arethusa').factory('HebrewRetriever', [
  'documentStore',
  'configurator',
  'idHandler',
  'languageSettings',
  'hebrewMorph',
  function (documentStore, configurator, idHandler, languageSettings, hebrewMorph) {
    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docIdentifier = conf.docIdentifier;

      function Token(id, string, map, terminator) {
        this.id = id;
        this.string = string;
        this.idMap = map;
        this.terminator = terminator;
      }

      function createIds(id) {
        var match = /^ref\.(\d+\.){3}(\d+)\.(\d+)$/.exec(id);
        var internalId = match[2] + '-' + match[3];
        var sourceId   = id;
        var idMap = new idHandler.Map();
        idMap.add(docIdentifier, internalId, sourceId);
        return { map: idMap, id: internalId };
      }

      function extractTokens(paragraph) {
        var result = {};

        angular.forEach(arethusaUtil.toAry(paragraph.sentence), function(sentence, i) {
          var tokens = arethusaUtil.toAry(sentence.token);
          var lastTokenI = tokens.length - 1;
          angular.forEach(tokens, function(token, otherI) {
            var ids = createIds(token._id);
            var string = token._surface;
            var term = otherI === lastTokenI;
            result[ids.id] = new Token(ids.id, string, ids.map, term);
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

