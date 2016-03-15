'use strict';
// A newable factory that spawns new resource
// objects, whichare a wrapper around ngResource
//
// Note that this approach right now doesn't work with totally freeform URL passed
// as route, because ngResource will always encode slashes.
// There is a pending issue for this https://github.com/angular/angular.js/issues/1388
//
// As it's not a top priority right now, we don't do anything. The quickest workaround
// (apart from patching angular) would be to fall back to $http.get()
//
angular.module('arethusa.core').factory('Resource', [
  '$resource',
  '$q',
  'locator',
  'spinner',
  function ($resource, $q, locator, spinner) {
    function paramsToObj(params) {
      return arethusaUtil.inject({}, params, function (obj, param, i) {
        obj[param] = locator.get(param);
      });
    }

    function isJson(header) {
      if (header) return header.match('json');
    }

    function collectedParams(a, b) {
      return angular.extend(paramsToObj(a), b) || {};
    }

    function parseResponse(data, headers) {
      var res = {};
      res.data = isJson(headers()['content-type']) ? JSON.parse(data) : data;
      res.headers = headers;
      res.source = 'tbd';
      // we need to define and http interceptor
      return res;
    }

    function createAborter() {
      return $q.defer();
    }

    return function (conf, auth) {
      var self = this;
      this.route = conf.route;
      this.params = conf.params || [];
      this.auth = auth;

      // Check right away if the user is logged in and notify
      // him when he isn't
      auth.checkAuthentication();

      var aborter;

      function createResource() {
        aborter = createAborter();
        return $resource(self.route, null, {
          get: {
            method: 'GET',
            withCredentials: auth.withCredentials,
            transformResponse: parseResponse,
            timeout: aborter.promise
          },
          save: {
            // TODO we need save and partial save -- latter will use PATCH
            method: 'POST',
            withCredentials: auth.withCredentials,
            transformRequest: function(data,headers) {
              var contentType = self.mimetype || 'application/json';
              headers()["Content-Type"] = contentType;
              if (isJson(contentType)) {
                data = angular.toJson(data);
              }
              self.auth.transformRequest(headers);
              return data;
            },
            transformResponse: parseResponse
          }
        });
      }
      this.resource = createResource();

      this.get = function (otherParams) {
        //spinner.spin();
        var params = collectedParams(self.params, otherParams);
        var promise = self.resource.get(params).$promise;
        //promise['finally'](spinner.stop);
        return promise;
      };

      var authFailure;
      this.save = function (data,mimetype) {
        //spinner.spin();

        var params = collectedParams(self.params,{});
        self.mimetype = mimetype;

        var q = $q.defer();
        var promise = q.promise;

        auth.withAuthentication(q, function() {
          return self.resource.save(params, data).$promise;
        });

        //promise['finally'](spinner.stop);
        return promise;
      };

      this.post = this.save;

      // This is not ideal - we have to re-create the complete resource, just
      // because we need one with a new resolvable promises, so that we can
      // abort it again.
      //
      // Needs another look. What I tried to do is to renew just the promise,
      // but not the complete promise. Wasn't really able to pull it off.
      // I guess the promise needs to be wrapped by another promise?!
      // It's no big deal to renew the resource, it just would be a little less
      // expensive to deal with a new promise only and leave the resource
      // untouched.
      this.abort = function() {
        aborter.resolve();
        self.resource = createResource();
      };
    };
  }
]);
