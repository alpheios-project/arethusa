'use strict';
/* This service handles everything related to configuration files
 *
 * It is a provider of resources and services.
 *
 * this.configuration needs to be set from the outside through
 * defineConfiguration(), typically by a route that enters the application.
 *
 *
 *
 * As of now a valid conf file contains four sections
 *   main
 *   navbar
 *   plugins
 *   resources
 *
 * Uses $http to retrieve additional configuration files that are embedded
 * through the fileUrl property.
 * This could eventually be replaced by using the arethusa resource service
 * once it's clear where such conf files will be stored. Or maybe not,
 * we'll see.
 *
 */
angular.module('arethusa.core').service('configurator', [
  '$injector',
  '$http',
  '$rootScope',
  'Resource',
  'Auth',
  '$timeout',
  '$location',
  'Loader',
  function ($injector, $http, $rootScope, Resource, Auth, $timeout, $location, Loader) {
    var self = this;
    var includeParam = 'fileUrl';

    var loader = new Loader();

    function filesToInclude(obj) {
      return arethusaUtil.findNestedProperties(obj, includeParam)[includeParam];
    }

    function checkLoadStatus() {
      if (loader.allLoaded()) {
        broadcastLoading();
      }
    }

    function broadcastLoading() {
      $rootScope.$broadcast('confLoaded');
    }

    // While using a timeout might seem hacky, it's just the write tool for the
    // job.
    // A run of the program looks like this:
    //
    // 1 Route with resolve function waits for the configurator to start
    // 2 Route resolves to start the MainCtrl
    // 3 MainCtrl waits for confLoaded event
    // 4 MainCtrl initializes the State object
    // 5 MainCtrl waits for stateLoaded event
    // 6 MainCtrl initializes itself and all plugins
    //
    // When the configurator needs to load external files (in 1)
    // the route resolves before the configurator is finished.
    // Only when it is finished the confLoaded event is fired.
    // External files are loaded asynchonously, the event is fired
    // from within a callback.
    // It is therefore guaranteed to happen after 2. Step 2 starts
    // the MainCtrl - it is the place where the listener to the
    // confLoaded event is defined.
    //
    // If there are no external files to load, the configurator gets
    // a chance to fire his confLoaded event while still being in step 1.
    // The event is fired, but as 2 hasn't run yet, there are no listeners.
    // The application fails to load properly.
    //
    // We therefore wrap the confLoaded event in a $timeout function.
    // Timeout with a delay of 0 defers the execution of the wrapped
    // function to the end of the current execution queue.
    // This is just what we need. Step 2 is already in the execution queue
    // at this time - if we can guarantee that the confLoaded event
    // happens after 2, everything is fine.
    function delayedBroadcast() {
      $timeout(function () {
        broadcastLoading();
      });
    }

    function includeExternalFiles(arrayOfObjects) {
      // If we have multiple files to include on the same level,
      // we need to declare all unloaded before we start including
      // files.
      angular.forEach(arrayOfObjects, function(obj, i) {
        loader.declareUnloaded(obj);
      });

      angular.forEach(arrayOfObjects, function (obj, i) {
        $http.get(obj[includeParam]).then(function (res) {
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
          loader.declareLoaded(obj);
          includeExternalFiles(filesToInclude(obj));
          checkLoadStatus();
        });
      });
    }

    // Receives an external file and resolves it to a valid configuration file.
    // The second param is optional.
    this.defineConfiguration = function (confFile, location) {
      var conf = this.loadConfFile(confFile, location);
      this.configuration = conf.data;
      this.confFileLocation = conf.location;
    };

    this.loadConfFile = function (confFile, location) {
      var conf = {
          location: location,
          data: confFile
        };
      var fti = filesToInclude(conf.data);
      if (fti.length === 0) {
        delayedBroadcast();
      } else {
        // this function will eventually broadcast the load event
        includeExternalFiles(fti);
      }
      return conf;
    };

    // Returns an empty configuration files with all sections
    // as empty object properties.
    // Useful for the configuration editor.
    this.getConfTemplate = function () {
      return {
        main: {},
        navbar: {},
        plugins: {},
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
    this.mergeConfigurations = function (a, b) {
      var that = this;
      angular.forEach(b, function (value, key) {
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

    this.getService = function (serviceName) {
      return $injector.get(serviceName);
    };

    this.getServices = function (serviceNames) {
      if (serviceNames) {
        var that = this;
        // inject to an object, we want the names as well
        return arethusaUtil.inject({}, serviceNames, function (obj, name) {
          obj[name] = that.getService(name);
        });
      } else {
        return {};
      }
    };

    // right now very hacky, not sure about the design of the conf file atm
    // we therefore just tell the service where the conf for specific things
    // is to be found in the JSON tree.
    // I guess the key is to abstract the conf file a little more.
    this.configurationFor = function (plugin) {
      var conf = self.configuration;
      return conf[plugin] || conf.plugins[plugin] || conf.resources[plugin] || {};
    };

    var standardProperties =  [
      'name',
      'main',
      'template',
      'external',
      'contextMenu',
      'contextMenuTemplate',
      'noView',
      'mode'
    ];

    // Delegates a set of standard properties to the given object to allow
    // a more direct access.
    this.delegateConf = function (obj, otherKeys, sticky) {
      var props = sticky ? otherKeys : arethusaUtil.pushAll(standardProperties, otherKeys);
      var defConf = obj.defaultConf || {};
      var isDef = angular.isDefined;
      angular.forEach(props, function (property, i) {
        if (sticky && isDef(obj[property])) return;

        var confProp = obj.conf[property];
        var isDefined = angular.isDefined(confProp);
        var val = isDef(confProp) ? confProp : defConf[property];
        obj[property] = val;
      });
      setGlobalDefaults(obj);
    };

    function setGlobalDefaults(obj) {
      angular.forEach(getGlobalDefaults(), function(value, key) {
        // Explicitly ask for undefined, as a false value can be a
        // valid configuration seting!
        if (obj[key] === undefined) {
          obj[key] = value;
        }
      });
    }

    var globalDefaults = {
      'mode' : 'editor'
    };
    function getGlobalDefaults() {
      var customDefaults = getGlobalCustomDefaults();
      var routeDefaults  = getGlobalDefaultsFromRoute();
      return angular.extend({}, globalDefaults, customDefaults, routeDefaults);
    }

    function getGlobalCustomDefaults() {
      return self.configuration.main.globalDefaults || {};
    }

    var routeParams = ['mode'];
    function getGlobalDefaultsFromRoute() {
      return arethusaUtil.inject({}, routeParams, function(memo, param) {
        var value = $location.search()[param];
        if (value) memo[param] = value;
      });
    }

    this.mode = function() {
      return getGlobalDefaults().mode;
    };

    this.getConfAndDelegate = function (name, obj, keys) {
      obj.conf = self.configurationFor(name);
      self.delegateConf(obj, keys);
      return obj;
    };

    this.getStickyConf = function(name, obj, keys) {
      obj.conf = self.configurationFor(name);
      self.delegateConf(obj, keys, true);
      return obj;
    };

    this.getRetrievers = function (retrievers) {
      return arethusaUtil.inject({}, retrievers, function (memo, name, conf) {
        var Retriever = self.getService(name);
        memo[name] = new Retriever(conf);
      });
    };
    // We alias this for now as the function has to do the same -
    // we might need a new name for it but we'll fix that later
    this.getPersisters = this.getRetrievers;

    this.getRetriever = function(retrievers) {
      var retrs = self.getRetrievers(retrievers);
      return retrs[Object.keys(retrs)[0]];
    };

    this.provideResource = function (name) {
      var conf = self.configuration.resources[name];
      if (!conf) return;
      return new Resource(conf, self.provideAuth(conf.auth));
    };

    function auths() {
      return self.configuration.auths || {};
    }

    this.provideAuth = function(name) {
      return new Auth(auths()[name] || {});
    };
  }
]);
