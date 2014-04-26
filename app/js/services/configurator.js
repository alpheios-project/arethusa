"use strict";

annotationApp.factory('configurator', function($http, $injector) {
  var fac = {};

  fac.path = './static/configuration1.json';

  var request = $.ajax({
    url: fac.path,
    async: false
  });

  request.done(function(data) {
    fac.configuration = data;
  });

  fac.getService = function(serviceName) {
    return $injector.get(serviceName);
  };

  fac.conf_for = function(plugin) {
    return fac.configuration[plugin];
  };

  return fac;
});
