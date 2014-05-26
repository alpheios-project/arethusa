"use strict";

angular.module('arethusa.morph').service('LexicalInventoryRetriever', function(configurator) {
  function buildDictionaryLinksQuery(urn) {
    var q = '\
      select ?object from <http://data.perseus.org/ds/lexical>\
      where {' +
        '<' + urn  + '>\
        <http://purl.org/dc/terms/isReferencedBy> ?object\
      }\
    ';
    return q;
  }

  function linkProvider(link) {
    if (link.match('alpheios')) {
      return 'Alpheios';
    } else {
      if (link.match('logeion')) {
        return 'Logeion';
      } else {
        if (link.match('perseus')) {
          return 'Perseus';
        }
      }
    }
  }

  function extractLinks(data) {
    var objs = data.results.bindings;
    return arethusaUtil.inject({}, objs, function(memo, obj) {
      var link = obj.object.value;
      memo[linkProvider(link)] = link;
    });
  }

  return function(conf) {
    var resource = configurator.provideResource(conf.resource);

    this.getData = function(urn, form) {
      var query = buildDictionaryLinksQuery(urn);
      resource.get({ query: query }).then(function(res) {
        var links = extractLinks(res.data);
        form.lexInv = {
          dictionaries: links
        };
      });

    };
  };
});
