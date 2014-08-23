"use strict";

angular.module('arethusa.core').service('plugins', [
  'configurator',
  '$injector',
  '$rootScope',
  function(configurator, $injector, $rootScope) {
    var self = this;
    var readyPlugins;
    var initCallbacks;

    function retrievePlugin(name) {
      var pluginConf = configurator.configurationFor(name);
      if (pluginConf.external) {
        // DEPRECATED: This API will change again.

        // We copy because this object will be extended once the plugin
        // is really initialized through the inclusion of its template
        // by the plugin directive.
        return angular.copy(pluginConf);
      } else {
        return $injector.get(name);
      }
    }

    function partitionPlugins() {
      self.main = [];
      self.sub  = [];
      self.withMenu = [];

      angular.forEach(self.all, self.registerPlugin);
    }

    function hasView(plugin) {
      return !(!plugin.template || plugin.noView);
    }

    this.registerPlugin = function(plugin, name) {
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


    this.start = function(pluginNames) {
      self.all = arethusaUtil.inject({}, pluginNames, function(memo, name) {
        memo[name] = retrievePlugin(name);
      });

      partitionPlugins();
      declareFirstActive();
      notifyListeners();
      self.init();
    };

    function notifyListeners() {
      angular.forEach(self.all, function(plugin, name) {
        $rootScope.$broadcast('pluginAdded', name, plugin);
      });
    }

    function initPlugin(plugin) {
      if (angular.isFunction(plugin.init)) plugin.init();
    }

    function declareFirstActive() {
      self.setActive(self.sub[0]);
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

    this.get = function(name) {
      return (self.all || {})[name] || {};
    };

    this.init = function() {
      readyPlugins = {};
      initCallbacks = new InitCallbacks();
      angular.forEach(self.all, initPlugin);
    };
  }
]);
