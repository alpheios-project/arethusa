"use strict";

angular.module('arethusa.core').service('globalSettings', [
  'configurator',
  'plugins',
  '$injector',
  function(configurator,  plugins, $injector) {
    var self = this;

    self.settings = {};
    self.colorizers = { disabled: true };


    var confKeys = [
      "alwaysDeselect",
      "colorizer"
    ];

    self.defaultConf = {
      alwaysDeselect: false,
      colorizer: 'morph'
    };

    function configure() {
      self.conf = configurator.configurationFor('main').globalSettings || {};
      configurator.delegateConf(self, confKeys, true); // true makes them sticky

      defineSettings();
    }

    function Conf(property, type, directive, label) {
      this.property = property;
      this.label = label || "globalSettings." + property;
      this.type = type || 'checkbox';
      this.directive = directive;
    }

    function defineSettings() {
      defineSetting('alwaysDeselect');
      defineSetting('keyboardMappings');
      defineSetting('colorizer', 'custom', 'colorizer-setting');
    }

    function defineSetting(property, type, options) {
      self.settings[property] = new Conf(property, type, options);
    }

    this.toggle = function() {
      self.active = !self.active;
    };

    this.addColorizer = function(pluginName) {
      self.colorizers[pluginName] = true;
    };

    this.isColorizer = function(pluginName) {
      return self.colorizer === pluginName;
    };

    function state() {
      return $injector.get('state');
    }

    this.applyColorizer = function() {
      if (self.colorizer === 'disabled') {
        state().unapplyStylings();
      } else {
        // Check if the colorizer is really present
        if (self.colorizers[self.colorizer]) {
          plugins.get(self.colorizer).applyStyling();
        }
      }
    };

    this.colorMaps = function() {
      return arethusaUtil.inject({}, self.colorizers, function(memo, name, _) {
        if (name !== 'disabled') {
          memo[name] = plugins.get(name).colorMap();
        }
      });
    };

    this.init = function() {
      configure();
    };
  }
]);
