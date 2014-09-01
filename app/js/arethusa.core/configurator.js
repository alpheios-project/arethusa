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
 */
angular.module('arethusa.core').service('configurator', [
  '$injector',
  '$http',
  '$rootScope',
  'Resource',
  'Auth',
  '$timeout',
  '$location',
  '$q',
  function ($injector, $http, $rootScope, Resource, Auth,
            $timeout, $location, $q) {
    var self = this;
    var includeParam = 'fileUrl';

    function notifier() {
      return $injector.get('notifier');
    }

    // The second param is optional.
    this.defineConfiguration = function (confFile, location) {
      this.configuration = angular.extend(new Template(), confFile);
      this.confFileLocation = location;

      // As this could be called from a resolve event through
      // $routeProvider, we $timeout to call, so that we are
      // guaranteed to see it in the ArethusaCtrl
      $timeout(function() {
        $rootScope.$broadcast('confLoaded');
      });
    };

    function parseConfUrl(url) {
      if (url.match('^http:\/\/')) {
        return url;
      } else {
        return 'http://services.perseids.org/arethusa-configs/' + url + '.json';
      }
    }

    this.loadAdditionalConf = function(confs) {
      var proms = arethusaUtil.inject([], confs, function(memo, plugin, url) {
        var promise;
        // Use the notifier for error handling!
        if (plugin == 'fullFile') {

          var success = function(res) {
            self.shallowMerge(self.configuration, res.data);
            notifier().info(url + ' configuration loaded!');
          };

          var error = function() {
            notifier().warning('Failed to retrieve ' + url);
          };
          promise = $http.get(parseConfUrl(url)).then(success, error);
        } else {
          promise = $http.get(url).then(function(res) {
            angular.extend(self.configurationFor(plugin), res.data);
          });
        }
        memo.push(promise);
      });
      return $q.all(proms);
    };

    function Template() {
      this.main = {};
      this.plugins = {};
      this.resources = {};
    }

    // Returns an empty configuration files with all sections
    // as empty object properties.
    // Useful for the configuration editor.
    this.getConfTemplate = function () {
      return new Template();
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
    // Currently unused after the events in
    //    http://github.com/latin-language-toolkit/arethusa/pull/365
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

    // this.shallowMerge(a, b)
    //
    // Merges two configuration files
    //
    // The markup of Arethusa config files needs special handling for merging.
    // The main sections can plainly merged through angular.extend, while
    // subSections can only be merged one level deeper.
    //
    var mainSections = ['main', 'navbar', 'notifier'];
    var subSections = ['plugins'];

    function mergeMainSections(a, b) {
      angular.forEach(mainSections, function(section, i) {
        var sectionA = a[section];
        var sectionB = b[section];
        if (!sectionB) return;

        mergeOrAdd(section, sectionA, sectionB, a);
      });
      var mainA = a.main;
      var mainB = b.main;
      if (!mainB) return;

      angular.extend(mainA, mainB);
    }

    function mergeSubSections(a, b) {
      var pluginsA = a.plugins;
      var pluginsB = b.plugins;
      if (!pluginsB) return;

      angular.forEach(pluginsB, function(conf, plugin) {
        var origConf = pluginsA[plugin];
        mergeOrAdd(plugin, origConf, conf, a);
      });
    }

    function mergeOrAdd(key, a, b, target) {
      if (a) {
        angular.extend(a, b);
      } else {
        target[key] = b;
      }
    }

    this.shallowMerge = function(a, b) {
      mergeMainSections(a, b);
      mergeSubSections(a, b);
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
      'displayName',
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

      if (!obj.displayName) {
        obj.displayName = obj.name;
      }

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

    this.getConfAndDelegate = function (obj, keys) {
      obj.conf = self.configurationFor(obj.name);
      self.delegateConf(obj, keys);
      return obj;
    };

    this.getStickyConf = function(obj, keys) {
      obj.conf = self.configurationFor(obj.name);
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

    this.addPluginConf = function(name, conf) {
      self.configuration.plugins[name] = conf;
    };
  }
]);
