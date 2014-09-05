"use strict";

angular.module('arethusa.core').factory('urlParser', [
  function() {
    function parseSearch(parser) {
      var search = parser.search.slice(1);
      var params = search.split('&');
      return arethusaUtil.inject({}, params, function(memo, param) {
        var parts = param.split('=');
        memo[parts[0]] = parts[1];
      });
    }

    function UrlParser(url) {
      var self = this;
      var parser = document.createElement('a');
      parser.href = url;

      this.url = url;
      this.params = parseSearch(parser);
    }

    return function(url) {
      return new UrlParser(url);
    };
  }
]);
