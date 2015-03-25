"use strict";

angular.module('arethusa.query').service('query', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this, retriever;
    this.name = 'query';

    this.defaultConf = {
      template: 'templates/arethusa.query/query.html',
      queryLimit: 10
    };

    this.currentPage = 0;
    this.query = query;

    function configure() {
      configurator.getConfAndDelegate(self);
      retriever = configurator.getRetriever(self.conf.retriever);
    }

    function query() {
      if (self.queryString) {
        resetPaginator();
        retrieveQuery();
      }
    }

    function getNextPage() {
      self.currentPage++;
      retrieveQuery();
    }

    function retrieveQuery() {
      var params = getQueryParams(self.queryString);
      retriever.get(params, function(results) {
        console.log(results);
      });
    }

    function resetPaginator() {
      self.currentPage = 1;
    }

    // Obtain the namespace of a active CTS urn and allow user to limit it
    // (to the language repository, the author, the work, the book etc)
    function getNamespace() {
    }

    function getQueryParams(str, start) {
      return {
        query: str,
        limit: self.queryLimit,
        start: self.currentPage
      };
    }


    this.init = function() {
      configure();
      getNamespace();
    };
  }
]);
