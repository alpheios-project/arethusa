"use strict";

annotationApp.factory('configurator', function($http, $injector) {
  var fac = {};

  var confs = ['text', 'morph', 'comment', 'main'];
  angular.forEach(confs, function(conf, key){
    // creating paths
    fac[conf + "_path"] = './static/' + conf + '_conf.json';

    // requesting files
    var request = $.ajax({
      url: fac[conf + "_path"],
      async: false
    });

    // store responses
    request.done(function(data) {
      fac[conf] = data;
    });
  });
  console.log(fac);

  fac.getService = function(serviceName) {
    return $injector.get(serviceName);
  };

  fac.conf_for = function(plugin) {
    var conf = fac.configuration;
    return conf[plugin] || conf.MainController.plugins[plugin];
  };

  return fac;
});
