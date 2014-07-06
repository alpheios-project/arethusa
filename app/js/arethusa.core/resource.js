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
  '$location',
  'spinner',
  function ($resource, $location, spinner) {
    function paramsToObj(params) {
      return arethusaUtil.inject({}, params, function (obj, param, i) {
        obj[param] = $location.search()[param];
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

    return function (conf,auth) {
      var self = this;
      this.route = conf.route;
      this.params = conf.params || [];
      this.auth = auth;
      auth.preflight();
      this.resource = $resource(self.route, null, {
        get: {
          method: 'GET',
          transformResponse: parseResponse
        },
        save: {
          // TODO we need save and partial save -- latter will use PATCH
          method: 'POST',
          transformRequest: function(data,headers) {
            if (self.mimetype) {
              headers()["Content-Type"] = self.mimetype;
            }
            self.auth.transformRequest(headers);
            return data;
          },
          transformResponse: parseResponse
        }
      });

      function stopSpinning(req) {
        var promise = req.$promise;
        promise['finally'](spinner.stop);
        return promise;
      }

      this.get = function (otherParams) {
        spinner.spin();
        var params = collectedParams(self.params, otherParams);
        return stopSpinning(self.resource.get(params));
      };

      this.save = function (data,mimetype) {
        spinner.spin();
        var params = collectedParams(self.params,{});
        self.mimetype = mimetype;
        return stopSpinning(self.resource.save(params,data));
      };

    };
  }
]);
