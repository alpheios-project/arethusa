'use strict';
angular.module('arethusa.core').factory('Auth', [
  '$resource',
  '$cookies',
  '$timeout',
  '$injector',
  'translator',
  function ($resource, $cookies, $timeout, $injector, translator) {
    var lazyNotifier;
    function notifier() {
      if (!lazyNotifier) lazyNotifier = $injector.get('notifier');
      return lazyNotifier;
    }

    function Pinger(url,withCredentials) {
      if (url) {
        var resource = $resource(url, null, { get: { withCredentials: withCredentials } });
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

    var translations = translator('auth.notLoggedIn', translations, 'notLoggedIn');

    return function(conf, modeFn) {
      var self = this;
      self.conf = conf;
      var skipModes = conf.skipModes || [];

      var authFailure;

      function modeToSkip() {
        return arethusaUtil.isIncluded(skipModes, modeFn());
      }

      function loginWarning() {
        authFailure = true;
        notifier().warning(translations.notLoggedIn(), null, 500);
      }

      function checkForAuthFailure(res) {
        if (res.status === 403) loginWarning();
      }

      this.withCredentials = conf.crossDomain ? true : false;

      var pinger = new Pinger(conf.ping,this.withCredentials);


      this.checkAuthentication = function() {
        if (modeToSkip()) return;
        pinger.checkAuth(noop, checkForAuthFailure);
      };

      this.withAuthentication = function(q, callback) {
        var err = function(res) {
          checkForAuthFailure(res);
          q.reject(res);
        };

        var suc = function(res) {
          authFailure = false;
          q.resolve(res);
        };

        var launch = function() {
          callback().then(suc, err);
        };

        // If we had no authFailure before, avoid the indirection and
        // launch the callback right away.
        if (!authFailure || modeToSkip()) {
          launch();
        } else {
          // Check auth will ideally restore our session cookie - we need to
          // $timeout, otherwise we don't see it updated!
          // Angular is polling every 100ms for new cookies, we therefore
          // have to wait a little.
          var authSuc = function() { $timeout(launch, 150); };
          pinger.checkAuth(authSuc, err);
        }
      };

      this.transformRequest = function(headers) {
        if (self.conf.type == 'CSRF') {
          headers()[self.conf.header] = $cookies[self.conf.cookie];
        }
      };
    };
  }
]);
