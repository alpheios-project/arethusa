"use strict";

annotationApp.factory('configurator', function($http, $injector) {
  var fac = {};

  var main = ['main'];
  var confs = ['text', 'morph', 'comment'];

  // loads main and plugin config files
  // params: confs is array of plugins; if sync is false,
  // files are loaded asynchronously (obliged for main!)
  var loadConfiguration = function(confs, sync) {
    angular.forEach(confs, function(conf, key){
      // creating paths
      fac[conf + "_path"] = './static/' + conf + '_conf.json';

      // requesting files
      var request = $.ajax({
        url: fac[conf + "_path"],
        async: sync
      });

      // store responses
      request.done(function(data) {
        fac[conf] = data;
      });
    });
  };

  // registers all loaded plugins in MainController
  var registerPlugins = function(plugins){
    angular.forEach(plugins, function(plugin, key) {
      fac.main.MainController.plugins[plugin] = fac[plugin];
    });
  };

  loadConfiguration(main, false);
  loadConfiguration(confs, false);
  registerPlugins(confs);

  fac.getService = function(serviceName) {
    return $injector.get(serviceName);
  };

  fac.conf_for = function(plugin) {
    var conf = fac.main;
    return conf[plugin] || conf.MainController.plugins[plugin];
  };

  return fac;
});
