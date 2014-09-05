"use strict";

angular.module('arethusa.core').factory('urlParser', [
  function() {
    function parseSearch(parser) {
      var search = parser.search.slice(1);
      var params = search.split('&');
      return arethusaUtil.inject({}, params, function(memo, param) {
        var parts = param.split('=');
        var key = parts[0];
        var val = parts[1] || true;
        var array = memo[key];
        var newVal  = array ? arethusaUtil.toAry(array).concat([val]) : val;
        memo[key] = newVal;
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
