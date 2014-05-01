"use strict";

annotationApp.factory('configurator', function($http, $injector) {
  var fac = {};

  fac.listAvailableConfs = function(){
    return ['text', 'morph', 'comment'];
  };

  // loads main and plugin config files
  // params: confs is array of plugins;
  var loadConfiguration = function(conf, path) {

    // creating paths
    if (path) {
      fac[conf + "_path"] = path;
    } else {
      fac[conf + "_path"] = './static/' + conf + '_conf.json';
    }

    // requesting files
    var request = $.ajax({
      url: fac[conf + "_path"],
      async: false
    });

    // store responses
    request.done(function(data) {
      fac[conf] = data;
    });
  };

  // registers all loaded plugins in MainController
  var registerPlugins = function(plugin) {
    fac.main.MainController.plugins[plugin] = fac[plugin];
  };

  loadConfiguration('main');

  fac.loadPlugin = function(plugin, path) {
    loadConfiguration(plugin, path);
    registerPlugins(plugin);
  };

  fac.getService = function(serviceName) {
    return $injector.get(serviceName);
  };

  fac.conf_for = function(plugin) {
    var conf = fac.main;
    return conf[plugin] || conf.MainController.plugins[plugin];
  };

  return fac;
});
