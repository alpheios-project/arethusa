"use strict";

angular.module('arethusa.core').factory('resource', function($resource, $location) {
  var obj = {
    init: function(route, params) {
      obj.resource = $resource(route, null, {
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
        'get' : {
          method: 'GET',
          transformResponse: function(data, headers) {
            var res = {};
            res.data = data;
            res.headers = headers;
            return res;
          }
        }
      });
      obj.params = params;
    },

    // Our custom get function reads params from the route as specified in the
    // configuration of a resource and takes additional params if need be.
    get: function(otherParams) {
      var params = angular.extend(paramsToObj(obj.params), otherParams || {});
      return obj.resource.get(paramsToObj(obj.params)).$promise;
    }
  };

  var paramsToObj = function(params) {
    return arethusaUtil.inject({}, params, function(obj, param, i) {
      obj[param] = $location.search()[param];
    });
  };


  // this will be called by the configurator actually
  obj.init('http://services.perseids.org/llt-data/:doc.xml', ['doc']);

  return obj;
});
