'use strict';
angular.module('arethusa.core').factory('Auth', [
  '$resource',
  '$cookies',
  '$timeout',
  '$injector',
  function ($resource, $cookies, $timeout, $injector) {

    function Pinger(url) {
      if (url) {
        var resource = $resource(url, null, {});
        this.checkAuth = function(success, error) {
          resource.get(success, error);
        };
      } else {
        this.checkAuth = function(success, error) {
          success();
        };
      }
    }

    function noop() {}

    function reject(q, d, s, h) {
      q.reject({ data: d, status: s, headers: h});
    }
    return function(conf) {
      var self = this;
      self.conf = conf;

      var pinger = new Pinger(conf.ping);

      this.checkAuthentication = function() {
        pinger.checkAuth(noop, noop);
      };

      this.withAuthentication = function(q, callback) {
        var authErr = function(d, s, h) {
          reject(q, d, s, h);
        };

        var err = function(d, s, h) {
          reject(q, d, s, h);
        };

        var suc = function() {
          // Ping has restored our session cookie - we need to $timeout,
          // otherwise we don't see it updated!
          // Angular is polling every 100ms for new cookies, we therefore
          // have to wait a little.
          $timeout(function() {
            callback().then(function(res) { q.resolve(res); }, authErr);
          }, 150);
        };

        pinger.checkAuth(suc, err);
      };

      this.transformResponse = function(headers) {
      };

      this.transformRequest = function(headers) {
        if (self.conf.type == 'CSRF') {
            headers()[self.conf.header] = $cookies[self.conf.cookie];
        }
      };
    };
  }
]);
