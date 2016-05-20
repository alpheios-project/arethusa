'use strict';

/**
 * @ngdoc service
 * @name arethusa.core.configurator
 *
 * @description
 * Service to handle the configuration of the application.
 *
 * A key component of Arethusa, typically injected by every plugin and many core services.
 *
 * Provides an API to
 * - access configurations
 * - create Retriever, Persister and Resource instances
 *
 * *Commented example configuration*
 * <pre>
 *   {
       // TODO
 *   }
 * </pre>
 *
 * @requires $injector
 * @requires $http
 * @requires $rootScope
 * @requires arethusa.core.Resource
 * @requires arethusa.core.Auth
 * @requires $timeout
 * @requires $location
 * @requires $q
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
    var uPCached;
    var mainSections = ['main', 'navbar', 'notifier'];
    var subSections = ['plugins'];
    
    // CONF UTILITY FUNCTIONS
    // ----------------------

    /** Returns an empty configuration files with all sections
     /* as empty object properties.
     /* Useful for the configuration editor.
     */
    this.getConfTemplate = function () {
      return new Template();

      function Template() {
        this.main = {};
        this.plugins = {};
        this.resources = {};
      }
    };

    this.mergeConfigurations = function (a, b) {
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

    this.shallowMerge = function(a, b) {
      // Merges two configuration files
      //
      // The markup of Arethusa config files needs special handling for merging.
      // The main sections can plainly merged through angular.extend, while
      // subSections can only be merged one level deeper.
      mergeMainSections(a, b);
      mergeSubSections(a, b);
      return a;
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
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#delegateConf
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Delegates configuration properties to an object, frequently a plugin,
     * for easier access.
     *
     * The object needs to come with his configuration file attached in a `conf`
     * property.
     *
     * A set of standard properties is always delegated to the object (view the source
     * code to see which), but `additionalProperties` can be given as an
     * Array of Strings.
     *
     * The configuration value to is determined according to the following order
     * of precedence:
     *
     * 1. {@link arethusa.core.userPreferences userPreferences} stored in a category
     *      determined by `object.name`
     * 2. The attached configuration in `object.conf`
     * 3. An objects optional default configuration in `object.defaultConf`
     * 4. globalDefaults specified in the ``main` section of the configuration file
     *
     * The optional `sticky` param determines what happens if an already configured
     * object is passed to this function.
     *
     * When `sticky` is true and a property is already set (this means it is not
     * `undefined`), it will not be overridden - the configuration will be 'sticky'.
     *
     *
     * @param {Object} object Object to delegate to
     * @param {Array} additionalProperties Additional properties to delegate in
     *   addition to the standard ones
     * @param {Boolean} [sticky=false] Whether or not delegation should be done sticky
     */
    this.delegateConf = function (obj, otherKeys, sticky) {
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
      var props = sticky ? otherKeys : arethusaUtil.pushAll(standardProperties, otherKeys);
      var defConf = obj.defaultConf || {};
      var isDef = function(arg) { return arg !== undefined && arg !== null; };
      angular.forEach(props, function (property, i) {
        if (sticky && isDef(obj[property])) return;

        var userProp = userPreferences().get(obj.name, property);
        var confProp = obj.conf[property];

        var val = isDef(userProp) ?
            userProp :
            isDef(confProp) ? confProp : defConf[property];

        obj[property] = val;
      });

      if (!obj.displayName) {
        obj.displayName = obj.name;
      }

      setGlobalDefaults(obj);
      function userPreferences() {
        if (!uPCached) uPCached = $injector.get('userPreferences');
        return uPCached;
      }
      function setGlobalDefaults(obj) {
        angular.forEach(getGlobalDefaults(), function(value, key) {
          // Explicitly ask for undefined, as a false value can be a
          // valid configuration seting!
          if (obj[key] === undefined) {
            obj[key] = value;
          }
        });
      }
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#getConfAndDelegate
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Retrieves an objects configuration defined by its `name` property and delegates
     * configuration properties to the object.
     *
     * Cf. {@link arethusa.core.configurator#methods_delegateConf delegateConf}.
     *
     * @param {Object} object Object to add configuration to. Frequently a plugin.
     * @param {Array} additionalProperties Additional properties passed to
     *   {@link arethusa.core.configurator#methods_delegateConf delegateConf}.
     * @returns {Object} The updated `object`.
     */
    this.getConfAndDelegate = function (obj, keys) {
      obj.conf = self.configurationFor(obj.name);
      self.delegateConf(obj, keys);
      return obj;
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#getStickyConf
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Works the same as {@link arethusa.core.configurator#methods_getConfAndDelegate getConfAndDelegate},
     * but with activated `sticky` mode (cf. {@link arethusa.core.configurator#methods_delegateConf delegateConf}).
     *
     * @param {Object} object Object to add configuration to. Frequently a plugin.
     * @param {Array} additionalProperties Additional properties passed to
     *   {@link arethusa.core.configurator#methods_delegateConf delegateConf}.
     * @returns {Object} The updated `object`.
     */
    this.getStickyConf = function(obj, keys) {
      obj.conf = self.configurationFor(obj.name);
      self.delegateConf(obj, keys, true);
      return obj;
    };

    // SET AND RETRIEVE CONFIGURATIONS
    // -------------------------------
    
    /**
     * @ngdoc property
     * @name configuration
     * @propertyOf arethusa.core.configurator
     *
     * @description
     * Stores the current configuration. Typically **NOT** meant to be accessed
     * directly.
     *
     * Use the getter
     * {@link arethusa.core.configurator#methods_configurationFor configurationFor}
     * and the setter
     * {@link arethusa.core.configurator#methods_defineConfiguration defineConfiguration}
     * instead.
     */
    this.configuration = this.getConfTemplate();

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#defineConfiguration
     * @methodOf arethusa.core.configurator
     *
     * @description Apply new configuration and broadcast confLoaded event
     *
     *
     * @params
     */
    this.defineConfiguration = function (confFile, location) {
      this.configuration = angular.extend(self.getConfTemplate(), confFile);
      this.confFileLocation = location;

      /**
       * @ngdoc event
       * @name arethusa.core.configurator#confLoaded
       * @eventOf arethusa.core.configurator
       *
       * @description
       * Broadcasted through {@link $rootScope} when the application's
       * configuration is ready to use. Before this event is launched, it is
       * **not** safe to instantiate services and/or plugins!
       *
       * Typically broadcased by {@link arethusa.core.configurator#methods_defineConfiguration defineConfiguration}.
       */
      // As this could be called from a resolve event through
      // $routeProvider, we $timeout to call, so that we are
      // guaranteed to see it in the ArethusaCtrl
      $timeout(function() {
        $rootScope.$broadcast('confLoaded');
      });
    };
    
    /**
     * @ngdoc function
     * @name arethusa.core.configurator#loadAdditionalConf
     * @methodOf arethusa.core.configurator
     *
     * @description
     * TODO
     */
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

      function parseConfUrl(url) {
        if (url.match('^http:\/\/')) {
          return url;
        } else {
          return auxConfPath() + '/' + url + '.json';
        }

        function auxConfPath() {
          return self.configuration.main.auxConfPath ||
              'http://services.perseids.org/arethusa-configs';
        }
      }
      function notifier() {
        return $injector.get('notifier');
      }
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#configurationFor
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Getter to retrieve configurations conveniently.
     *
     * Looks for the configuration in the main section, the plugins and
     * the resource section. Returns `{}` when no configuration is present.
     *
     * @param {String} name Name of the requested configuration
     * @returns {Object} A configuration.
     */
    this.configurationFor = function (plugin) {
      var conf = self.configuration;
      return conf[plugin] || conf.plugins[plugin] || conf.resources[plugin] || {};
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#addPluginConf
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Adds a plugin configuration.
     *
     * @param {String} name The name of the plugin
     * @param {Object} conf Configuration of the plugin
     */
    this.addPluginConf = function(name, conf) {
      self.configuration.plugins[name] = conf;
    };

    // GET SERVICES AND RETRIEVERS/PERSISTERS
    // --------------------------------------

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#getRetrievers
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Creates new Retriever instances.
     * TODO
     * @param {Object} retrievers *Keys:* Name of the Retriever class;
     *   *Values*: Retriever configuration
     *
     * @returns {Object} *Keys:* Name of the Retriever class; *Values:* The Retriever instance.
     */
    this.getRetrievers = function (retrievers) {
      return arethusaUtil.inject({}, retrievers, function (memo, name, conf) {
        var Retriever = self.getService(name);
        memo[name] = new Retriever(conf);
      });
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#getPersisters
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Creates new Persister instances.
     * TODO
     * @param {Object} retrievers *Keys:* Name of the Persister class;
     *   *Values*: Persister configuration
     *
     * @returns {Object} *Keys:* Name of the Persister class; *Values:* The Persister instance.
     * TODO
     */
    // We alias this for now as the function has to do the same -
    // we might need a new name for it but we'll fix that later
    this.getPersisters = this.getRetrievers;

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#getRetriever
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Similar to {@link arethusa.core.configurator#methods_getRetrievers getRetrievers}
     * operates on a single instance only.
     *
     * @param {Object} retrievers *Key:* Name of the Retriever class;
     *   *Value*: Retriever configuration
     *
     * @returns {Object} A new retriever instance.
     * TODO
     */
    this.getRetriever = function(retrievers) {
      var retrs = self.getRetrievers(retrievers);
      return retrs[Object.keys(retrs)[0]];
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#getService
     * @methodOf arethusa.core.configurator
     *
     * @description
     * TODO
     */
    this.getService = function (serviceName) {
      return $injector.get(serviceName);
    };

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#getServices
     * @methodOf arethusa.core.configurator
     *
     * @description
     * TODO
     */
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

    // UTILITIES FOR ACCESSING REMOTE RESOURCES
    // ----------------------------------------

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#provideResource
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Creates a new {@link arethusa.core.Resource Resource} instance, including
     * proper {@link arethusa.core.Auth Auth} support.
     *
     * Returns `undefined` when no configuration for a the given resource is present.
     *
     * @param {String} name The name of the resource as specified in a conf file
     * @returns {Resource} A new {@link arethusa.core.Resource Resource} instance
     */
    this.provideResource = function (name) {
      var conf = self.configuration.resources[name];
      if (!conf) return;
      return new Resource(conf, self.provideAuth(conf.auth));
    };

    /**
     * Creates an Auth instance for name if available
     * @param name of Auth configuration to instantiate
     * @returns {*} Auth object
       */
    this.provideAuth = function(name) {
      return new Auth(auths()[name] || {}, self.mode);

      function auths() {
        return self.configuration.auths || {};
      }
    };

    // GLOBAL DEFAULT CONFIG
    // ---------------------

    /**
     * @ngdoc function
     * @name arethusa.core.configurator#mode
     * @methodOf arethusa.core.configurator
     *
     * @description
     * Getter to read the current global mode of the application.
     *
     * @returns {String} The current mode, e.g. `'editor'` or `'viewer'`.
     */
    this.mode = function() {
      return getGlobalDefaults().mode;
    };

    function getGlobalDefaults() {
      var globalDefaults = { 'mode' : 'editor' };
      var customDefaults = getGlobalCustomDefaults();
      var routeDefaults  = getGlobalDefaultsFromRoute();
      return angular.extend({}, globalDefaults, customDefaults, routeDefaults);

      function getGlobalCustomDefaults() {
        return self.configuration.main.globalDefaults || {};
      }
      function getGlobalDefaultsFromRoute() {
        var routeParams = ['mode'];
        return arethusaUtil.inject({}, routeParams, function(memo, param) {
          var value = $location.search()[param];
          if (value) memo[param] = value;
        });
      }
    }
  }
]);
