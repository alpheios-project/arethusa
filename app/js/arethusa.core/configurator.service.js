"use strict";

/* This service handles everything related to configuration files
 *
 * It is a provider of resources and services.
 *
 * this.configuration needs to be set from the outside through
 * defineConfiguration(), typically by a route that enters the application.
 *
 *
 *
 * As of now a valid conf file contains five sections
 *   main
 *   navbar
 *   plugins
 *   retrievers
 *   resources
 *
 * Uses $http to retrieve additional configuration files that are embedded
 * through the fileUrl property.
 * This could eventually be replaced by using the arethusa resource service
 * once it's clear where such conf files will be stored. Or maybe not,
 * we'll see.
 *
 */

angular.module('arethusa.core').service('configurator', function($injector, $http, resource) {
  this.defineConfiguration = function(confFile) {
    this.configuration = confFile;
    var toReplace = arethusaUtil.findNestedProperties(this.configuration, 'fileUrl');
    angular.forEach(toReplace, function(objs, key) {
      angular.forEach(objs, function(obj, i) {
        $http.get(obj[key]).then(function(res) {
          angular.extend(obj, res.data);
        });
      });
    });
  };

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
    return conf[plugin] ||
      conf.plugins[plugin] ||
      conf.retrievers[plugin] ||
      conf.resources[plugin];
  };

  // right now very hacky, not sure about the design of the conf file atm
  // we therefore just tell the service where the conf for specific things
  // is to be found in the JSON tree.
  // I guess the key is to abstract the conf file a little more.
  this.provideResource = function(name) {
    var conf = this.configuration.resources[name];
    // we get the resource factory through the injector, and not by regular
    // dependency injection, because we always want to return a new instance!
    return resource.create(conf);
  };
});
