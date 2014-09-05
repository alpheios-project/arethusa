"use strict";

angular.module('arethusa.core').factory('urlParser', [
  function() {
    function parseSearch(hrefParser) {
      var search = hrefParser.search.slice(1);
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

    function toParam(k, v) {
      return k + '=' + v;
    }

    function updateUrl(parser, href) {
      var newUrl = parser.url.replace(href.search, '?');
      var params = [];
      angular.forEach(parser.params, function(value, key) {
        if (angular.isArray(value)) {
          angular.forEach(value, function(el) {
            params.push(toParam(key, el));
          });
        } else {
          params.push(toParam(key, value));
        }
      });
      parser.url = newUrl + params.join('&');
    }

    function UrlParser(url) {
      var self = this;
      var parser = document.createElement('a');
      parser.href = url;

      this.url = url;
      this.params = parseSearch(parser);

      this.set = function(paramsOrKey, val) {
        if (angular.isString(paramsOrKey) && val) {
          this.params[paramsOrKey] = val;
        }

        updateUrl(self, parser);
      };
    }

    return function(url) {
      return new UrlParser(url);
    };
  }
]);
