"use strict";

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
angular.module('arethusa.core').factory('Resource', function($resource, $location) {
  function paramsToObj(params) {
    return arethusaUtil.inject({}, params, function(obj, param, i) {
      obj[param] = $location.search()[param];
    });
  }

  function isJson(header) {
    return header === 'application/json';
  }

  function collectedParams(a, b) {
    return angular.extend(paramsToObj(a), b) || {};
  }

  return function(conf) {
    var self = this;
    this.route = conf.route;
    this.params = conf.params || [];

    this.resource = $resource(self.route, null, {
      // This might look exceedingly stupid, but it is not:
      // We override the usual get method ngResource, so that we can handle
      // xml here as well, something the original struggles a bit with, as it
      // always awaits a JSON response. In the transformResponse function we
      // have access to the real response data - we set this right onto a new
      // object together with the original headers.
      // This way the xml string of the http call is not mangled up by angular.
      // We'll see if this leads to troubles with real JSON calls. If it does,
      // we just add a configuration setting of xml: true, which triggers this
      // behaviour.
      // The only downside is, that we have to call res.data instead of just res
      // in the callback, but that is something we can live with.
      get : {
        method: 'GET',
        transformResponse: function(data, headers) {
          var res = {};
          res.data = isJson(headers()['content-type']) ? JSON.parse(data) : data;
          res.headers = headers;
          res.source = 'tbd'; // we need to define and http interceptor
          return res;
        }
      }
    });

    this.get = function(otherParams) {
      var params = collectedParams(self.params, otherParams);
      return self.resource.get(params).$promise;
    };
  };
});
