"use strict";

angular.module('arethusa.core').factory('DocumentResolver', [
  'configurator',
  '_',
  function(configurator, _) {
    return function DocumentResolver(conf) {
      var resource = configurator.provideResource(conf.resource);

      this.resolve = resolve;

      function resolve(retrievers, onSuccessFnGenerator) {
        resource.get().then(function(res) {
          var docs = res.data;
          _.forEach(docs, function(link, type) {
            var retriever = getRetriever(retrievers, type);
            if (retriever) {
              var params = { doc: link };
              retriever.get(params, onSuccessFnGenerator(retriever));
            }
          });
        });
      }

      function getRetriever(retrievers, type) {
        var name = conf.map[type];
        if (name) return retrievers[name];
      }
    };
  }
]);
