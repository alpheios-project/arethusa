'use strict';
angular.module('arethusa.core').factory('Auth', [
  '$resource',
  '$cookies',
  '$timeout',
  function ($resource, $cookies, $timeout) {

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

    return function(conf) {
      var self = this;
      self.conf = conf;

      var pinger = new Pinger(conf.ping);

      this.preflight = function() {
        // if the authorization config for this resource has a
        // ping method configured, use it to initialize the cookies
        if (self.conf.ping) {
          var ping = $resource(self.conf.ping, null, { });
          // TODO should really have some error handling here
          // because if the ping fails the subsequent get and post
          // requests on the resource will
          ping.get();
        }
      };

      this.withAuthentication = function(q, callback) {
        var success = function() {
          // Ping has restored our session cookie - we need to $timeout,
          // otherwise we don't see it updated!
          // Angular is polling every 100ms for new cookies, we therefore
          // have to wait a little.
          $timeout(function() {
            callback().then(function(res) {
              q.resolve(res);
            }, function(res) {
              q.reject(res);
            });
          }, 150);
        };

        var error = function(data, status, headers) {
          // Ask to re-login here!
          q.reject({ data: data, status: status, headers: headers });
        };

        pinger.checkAuth(success, error);
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
