"use strict";

angular.module('arethusa.core').service('configurator', function($injector, resource) {
  this.getService = function(serviceName) {
    return $injector.get(serviceName);
  };

  this.getServices = function(serviceNames) {
    if (serviceNames) {
      var that = this;
      // inject to an object, we want the names as well
      return arethusaUtil.inject({}, serviceNames, function(obj, name) {
        obj[name] = that.getService(name);
      });
    } else {
      return {};
    }
  };

  // this.configuration is set from outside on page load
  this.configurationFor = function(plugin) {
    var conf = this.configuration;
    return conf[plugin] || conf.MainCtrl.plugins[plugin];
  };

  // right now very hacky, not sure about the design of the conf file atm
  // we therefore just tell the service where the conf for specific things
  // is to be found in the JSON tree.
  // I guess the key is to abstract the conf file a little more.
  this.provideResource = function(name) {
    var confs = {
      treebankRetriever: this.configuration.state.retrievers.treebankRetriever,
      bspMorphRetriever: this.configuration.MainCtrl.plugins.morph.retrievers.bspMorphRetriever
    };

    var conf = confs[name].resource;
    // we get the resource factory through the injector, and not by regular
    // dependency injection, because we always want to return a new instance!
    return resource.create(conf);
  };
});
