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

angular.module('arethusa.core').service('configurator', function($injector, $http, $rootScope, resource) {
  var includeParam = 'fileUrl';

  var filesToInclude = function(obj) {
    return arethusaUtil.findNestedProperties(obj, includeParam)[includeParam];
  };

  var loadStates = {};

  var checkLoadStatus = function() {
    var loaded = true;
    angular.forEach(loadStates, function(loadState, obj) {
      loaded = loaded && loadState;
    });

    if (loaded) {
      broadcastLoading();
    }
  };

  var broadcastLoading = function() {
    $rootScope.$broadcast('confLoaded');
  };

  var includeExternalFiles = function(arrayOfObjects) {
    angular.forEach(arrayOfObjects, function(obj, i) {
      loadStates[obj] = false;

      $http.get(obj[includeParam]).then(function(res) {
        // We have to delete fileUrl upfront.
        // When the object gets extended by a response, this response
        // might contain another fileUrl property. If that is the case
        // we then go on to look for such properties and call the function
        // recursively.
        delete obj[includeParam];
        angular.extend(obj, res.data);

        // As we want to load all potential external conf file BEFORE the application
        // starts, we have to apply this little trick:
        // Before the asynchronous call to retrieve an external file is made, we
        // declare a false load status, which we resolve inside the callback.
        //
        // Once we say we are loaded, we immediately check if our now extended object
        // has another external file to load. If it does, the load status of our
        // object will be immediately false again.
        // On the end of each callback we check all load states. If everything has
        // loaded successfully, we broadcast an event an let others now that the
        // configurator is finished.
        loadStates[obj] = true;
        includeExternalFiles(filesToInclude(obj));
        checkLoadStatus();
      });
    });
  };

  this.defineConfiguration = function(confFile) {
    this.configuration = confFile;
    includeExternalFiles(filesToInclude(this.configuration));
  };

  // Returns an empty configuration files with all sections
  // as empty object properties.
  // Useful for the configuration editor.
  this.loadConfTemplate = function() {
    this.configuration = {
      main: {},
      navbar: {},
      plugins: {},
      retrievers: {},
      resources: {}
    };
  };

  // Merges two configuration objects.
  // There is a clear contract that has to be fulfilled to make this work:
  //
  // The datatypes of individual properties need to be static.
  // E.g.
  //
  // {
  //   plugins: {
  //     morph: {
  //       retrievers: ['x']
  //     }
  //   }
  // }
  //
  // If plugins.morph.retrievers is an Array, it can only be an Array and nothing
  // else. The same goes for Objects, Strings, and Numbers.
  //
  // Objects call the function recursively.
  // Arrays are flat-pushed.
  // Strings and Numbers are overwritten.
  // a is extended with properties in b, that are not present in a.
  //
  this.mergeConfigurations = function(a, b) {
    var that = this;
    angular.forEach(b, function(value, key) {
      var origVal = a[key];
      if (origVal) {
        // Every Array is an Object, but not every Object is an Array!
        // This defines the order of the if-else conditional.
        if (angular.isArray(origVal)) {
          arethusaUtil.pushAll(origVal, value);
        } else if (angular.isObject(origVal)) {
          that.mergeConfigurations(origVal, value);
        } else {
          a[key] = value;
        }
      } else {
        a[key] = value;
      }
    });

    return a;
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
