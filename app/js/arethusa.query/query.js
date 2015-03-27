"use strict";

angular.module('arethusa.query').service('query', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this, retriever;
    this.name = 'query';

    this.currentPage = 0;
    this.query = query;
    this.getNextPage = getNextPage;
    this.getPage = getPage;

    this.defaultConf = {
      template: 'templates/arethusa.query/query.html',
      queryLimit: 20
    };

    var props = [
      'queryLimit'
    ];

    function configure() {
      configurator.getConfAndDelegate(self, props);
      retriever = configurator.getRetriever(self.conf.retriever);
    }

    function query() {
      if (self.queryString) {
        retrieveQuery(1, function(reply) {
          setQueryStats(reply);
        });
      }
    }

    function getNextPage() {
      getPage(self.queryStats.page + 1);
    }

    function getPreviousPage() {
      getPage(self.queryStats.page - 1);
    }

    function getPage(i) {
      setPage(i);
      var offset = (i - 1) * self.queryLimit + 1;
      retrieveQuery(offset);
    }

    function setPage(i) {
      self.queryStats.page = i;
    }

    function retrieveQuery(offset, cb) {
      var params = getQueryParams(self.queryString, offset);
      doSpinning(function() {
        return retriever.get(params, function(data) {
          var reply = data.reply;
          if (cb) { cb(reply); }
          parseQueryData(reply);
        });
      });
    }

    function parseQueryData(res) {
      self.queryStats.start = res.offset;
      self.queryStats.end   = res.offset + res.results.length - 1;
      self.currentPage = res;
    }

    function setQueryStats(res) {
      self.queryStats = {
        total: res.count,
        pages: createPages(Math.ceil(res.count / res.limit)),
        page: 1,
      };
    }

    function createPages(count) {
      // This is basically just an array of empty elements to ng-repeat
      // over them.
      var result = [];
      for (var i = 0; i  < count; i ++) {
        result.push(i + 1);
      }
      return result;
    }

    // Obtain the namespace of a active CTS urn and allow user to limit it
    // (to the language repository, the author, the work, the book etc)
    function getNamespace() {
      return 'urn:cts:latinLit';
    }

    function getQueryParams(str, start) {
      return {
        query: str,
        limit: self.queryLimit,
        start: start,
        urn: getNamespace()
      };
    }

    function doSpinning(cb) {
      var promise = cb();
      self.queryInProgress = true;
      promise['finally'](function() { self.queryInProgress = false; });
      return promise;
    }


    this.init = function() {
      configure();
      getNamespace();
    };
  }
]);
