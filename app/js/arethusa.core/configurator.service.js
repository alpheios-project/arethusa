"use strict";

angular.module('arethusa.core').service('configurator', function($injector) {
  this.getService = function(serviceName) {
    return $injector.get(serviceName);
  };

  this.getServices = function(serviceNames) {
    var res = [];
    var that = this;
    angular.forEach(serviceNames, function(name, i) {
      res.push(that.getService(name));
    });
    return res;
  };

  // this.configuration is set from outside on page load
  this.configurationFor = function(plugin) {
    var conf = this.configuration;
    return conf[plugin] || conf.MainCtrl.plugins[plugin];
  };
});
