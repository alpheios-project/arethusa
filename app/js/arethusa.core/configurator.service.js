"use strict";

/* global arethusaUtil */

angular.module('arethusa.core').service('configurator', function($injector) {
  this.getService = function(serviceName) {
    return $injector.get(serviceName);
  };

  this.getServices = function(serviceNames) {
    if (serviceNames) {
      var that = this;
      return arethusaUtil.map(serviceNames, function(name) {
        return that.getService(name);
      });
    } else {
      return [];
    }
  };

  // this.configuration is set from outside on page load
  this.configurationFor = function(plugin) {
    var conf = this.configuration;
    return conf[plugin] || conf.MainCtrl.plugins[plugin];
  };
});
