"use strict";

angular.module('arethusa.core').service('plugins', [
  'configurator',
  '$injector',
  '$rootScope',
  '$q',
  '$timeout',
  'dependencyLoader',
  'notifier',
  'translator',
  function(configurator, $injector, $rootScope, $q, $timeout, dependencyLoader,
          notifier, translator) {
    var self = this;
    var readyPlugins;
    var initCallbacks;

    var translations = translator({
      'plugins.added': 'added',
      'plugins.failed': 'failed',
      'plugins.alreadyLoaded': 'alreadyLoaded'
    });

    function loadPlugin(name) {

      function LoadRequest(name, location) {

        function toSnakeCase(str) { return str.replace(/([A-Z])/g, '_$1').toLowerCase(); }

        var self = this;
        function getName(name, location) {
          return location ? name : 'arethusa.' + name;
        }

        function getLocation(location) {
          return (location || 'dist/' + toSnakeCase(self.name) + '.min.js');
        }

        this.name = getName(name, location);
        this.files = [getLocation(location)];
      }

      // The history plugin is special - as it's is always part of the
      // application, just not always as visible plugin.
      // We therefore don't need to retrieve it again - the Arethusa
      // module already knows about it.
      if (name === 'history') {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
      } else {
        var pluginConf = configurator.configurationFor(name);
        var request = new LoadRequest(name, pluginConf.location);
        return dependencyLoader.load(request);
      }
    }

    function loadExtDep(extDep) {

      function wrapInPromise(callback) {
        var deferred = $q.defer();
        callback()['finally'](aU.resolveFn(deferred));
        return deferred.promise;
      }

      if (angular.isArray(extDep)) {
        return dependencyLoader.load(extDep);
      } else {
        var ordered = extDep.ordered;
        var unordered = extDep.unordered;
        var promises = [];
        if (ordered) {
          promises.push(wrapInPromise(function() {
            return dependencyLoader.loadInOrder(ordered);
          }));
        }
        if (unordered) {
          promises.push(wrapInPromise(function() {
            return dependencyLoader.load(unordered);
          }));
        }
        return $q.all(promises);
      }
    }

    function getFromInjector(name) {
      var woNamespace = name.replace(/.*?\./, '');
      return $injector.get(woNamespace);
    }

    function loadPlugins(pluginNames) {

      function resolveWhenReady(names, loader) {
        function loadComplete(pluginNames) { return Object.keys(self.loader).length === pluginNames.length; }
        if (loadComplete(names)) loader.resolve();
      }

      var loader = $q.defer();

      angular.forEach(pluginNames, function(name, i) {
        var externalDependencies;
        var load = loadPlugin(name);
        var plugin;
        load.then(
          function success() {
            plugin = getFromInjector(name);
            var extDep = plugin.externalDependencies;
            if (extDep) {
              externalDependencies = loadExtDep(extDep);
            } else {
              self.loader[name] = getFromInjector(name);
            }
           },
          function error() { self.loader[name] = false; }
        );

        load['finally'](function() {
          if (externalDependencies) {
            externalDependencies['finally'](function() {
              self.loader[name] = getFromInjector(name);
              resolveWhenReady(pluginNames, loader);
            });
          } else {
            resolveWhenReady(pluginNames, loader);
          }
        });
      });

      return loader.promise;
    }

    function notify(plugin, name) {
      $timeout(function() {
        $rootScope.$broadcast('pluginAdded', name, plugin);
      });
    }


    // Working on the assumptions that plugins will generally be grouped
    // in something like a tabset - impossible to show them all at the same
    // time, we expose some variables and functions to get info about their
    // visibility.
    // Templates can use this to implement ngIf, which removes elements
    // temporarily from the DOM.
    // Very useful - example use case:
    //   We have the morph plugin included in our configuration, but have
    //   selected a different tab at the moment, i.e. we are displaying
    //   the view of another plugin. The morph view wouldn't have to be
    //   rendered in the background!
    //
    // As we will mostly likely listen to click events for this, we have
    // to declare a first visible plugin in the init() function of this
    // controller, otherwise a user wouldn't be able to see something when
    // he first loads the page.
    //
    // Some plugins might have to rely on working in the background too.
    // Generally this shouldn't be the case, because all business logic
    // should be out of the DOM anyway. If a plugin still needs this, it can
    // do so by setting its alwaysActiveproperty to true.

    this.setActive = function(plugin) {
      self.active = plugin;
    };

    this.isActive = function(plugin) {
      return self.isSelected(plugin) && !plugin.alwaysActive;
    };

    this.isSelected = function(plugin) {
      return plugin === self.active;
    };

    this.doAfter = function(pluginName, fn) {
      initCallbacks.add('after', pluginName, fn);
    };

    this.declareReady = function(pluginOrName) {
      var name = typeof pluginOrName === 'string' ? pluginOrName : pluginOrName.name;
      readyPlugins[name] = true;
      initCallbacks.resolve('after', name);
    };

    this.get = function(name) {
      return (self.all || {})[name] || {};
    };

    this.addPlugin = function(name, conf) {
      if (self.all[name]) {
        notifier.warning(translations.alreadyLoaded({ name: name }));
        return;
      }

      if (conf) configurator.addPluginConf(name, conf);
      var deferred = $q.defer();
      var promise  = deferred.promise;
      var loader = loadPlugin(name);
      var plugin, dependencies;

      var loadSuccess = function() {
        plugin = $injector.get(name);
        var extDep = plugin.externalDependencies;
        if (extDep) {
          loadExtDep(extDep).then(resolve, reject);
        } else {
          resolve();
        }
      };

      var resolve = function() {
        self.all[name] = plugin;
        self.registerPlugin(plugin);
        plugin.init();
        notify(plugin, name);
        notifier.success(translations.added({ name: name }));
        deferred.resolve(plugin);
      };

      var reject = function() {
        notifier.error(translations.failed({ name: name }) + "!");
        deferred.reject();
      };

      loader.then(loadSuccess, reject);
      return promise;
    };

    this.registerPlugin = function(plugin, name) {

      function hasView(plugin) { return !(!plugin.template || plugin.noView); }

      if (hasView(plugin)) {
        if (plugin.main) {
          self.main.push(plugin);
        } else {
          self.sub.push(plugin);
        }
      }
      if (plugin.contextMenu) {
        self.withMenu.push(plugin);
      }
    };

    this.init = function() {
      function InitCallbacks() {
        var self = this;
        var cl   = InitCallbacks;
        this.after  = {};
        this.before = {};

        cl.prototype.resolve = function(timing, pluginName) {
          var cbs = self[timing][pluginName] || [];
          angular.forEach(cbs, function(cb, i) { cb(); });
        };

        cl.prototype.add = function(timing, pluginName, fn) {
          var t = self[timing];
          var cbs = t[pluginName];
          if (!cbs) cbs = t[pluginName] = [];
          cbs.push(fn);
          if (readyPlugins[pluginName]) fn();
        };
      }
      function initPlugin(plugin) { if (angular.isFunction(plugin.init)) plugin.init(); }
      readyPlugins = {};
      initCallbacks = new InitCallbacks();
      angular.forEach(self.all, initPlugin);
    };

    this.start = function(pluginNames) {
      function sortPlugins(names) { angular.forEach(names, function(name, i) {
        var plugin = self.loader[name];
        if (plugin) self.all[name] = plugin;
      }); }
      function partitionPlugins() {
        self.main = [];
        self.sub  = [];
        self.withMenu = [];
        angular.forEach(self.all, self.registerPlugin);
      }
      function declareFirstActive() { self.setActive(self.sub[0]); }
      function notifyListeners() { angular.forEach(self.all, notify); }
      self.loaded = false;
      self.loader = {};
      self.all = {};
      var result = $q.defer();

      loadPlugins(pluginNames).then(function() {
        sortPlugins(pluginNames);
        self.init();
        partitionPlugins();
        declareFirstActive();
        notifyListeners();
        self.loader = {};
        self.loaded = true;
        $rootScope.$broadcast('pluginsLoaded');
        result.resolve();
      });

      return result.promise;
    };
  }
]);
