"use strict";

angular.module('arethusa.core').service('globalSettings', [
  'configurator',
  'plugins',
  '$injector',
  '$rootScope',
  'notifier',
  'translator',
  'keyCapture',
  '$timeout',
  function(configurator,  plugins, $injector, $rootScope, notifier,
           translator, keyCapture, $timeout) {
    var self = this;

    self.name = 'globalSettings'; // configurator will ask for this
    self.layout = {};
    self.settings = {};
    self.colorizers = { disabled: true };

    var trsls = {};
    translator('globalSettings.layoutLoaded', trsls, 'layoutLoaded', true);

    var confKeys = [
      "alwaysDeselect",
      "colorizer",
      "persistSettings",
      "disableKeyboardMappings"
    ];

    self.defaultConf = {
      alwaysDeselect: false,
      colorizer: 'morph',
      persistSettings: true,
      disableKeyboardMappings: false
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
      self.defineSetting('persistSettings');
      self.defineSetting('chunkMode', 'custom', 'chunk-mode-switcher');
      self.defineSetting('clickAction', 'custom', 'global-click-action');
      self.defineSetting('alwaysDeselect');
      self.defineSetting('disableKeyboardMappings');
      self.defineSetting('colorizer', 'custom', 'colorizer-setting');
      self.defineSetting('layout', 'custom', 'layout-setting');
    }

    this.defineSetting = function(property, type, directive, label) {
      self.settings[property] = new Conf(property, type, directive, label);
    };

    this.removeSetting = function(setting) {
      delete self.settings[setting];
    };

    this.propagateSetting = function(property) {
      userPreferences().set(self.name, property, self[property]);
    };

    this.toggle = function() {
      self.active = !self.active;
    };

    var deselectors = {};

    this.deselectAfterAction = function(action) {
      deselectors[action] = true;
    };

    this.noDeselectAfterAction = function(action) {
      deselectors[action] = false;
    };

    this.shouldDeselect = function(action) {
      return self.alwaysDeselect || deselectors[action];
    };

    this.defaultClickAction = function(id) {
      state().toggleSelection(id, 'click');
    };

    this.clickActions = {};


    this.addClickAction = function(name, fn, preFn) {
      self.clickActions[name] = [fn, preFn];
    };

    this.removeClickAction = function(name) {
      delete self.clickActions[name];
      if (self.clickAction === name) self.setClickAction('disabled');
    };

    this.setClickAction = function(name, silent) {
      // When nothing changed, we don't need to do anything
      if (self.clickAction !== name) {
        self.clickAction = name;
        var actions = self.clickActions[self.clickAction];
        self.clickFn = actions[0];
        self.preClickFn = actions[1];
        if (!silent) {
          $rootScope.$broadcast('clickActionChange');
        }
      }
    };

    this.addColorizer = function(pluginName) {
      self.colorizers[pluginName] = true;
    };

    this.isColorizer = function(pluginName) {
      return self.colorizer === pluginName;
    };

    var lazyState;
    function state() {
      if (!lazyState) lazyState = $injector.get('state');
      return lazyState;
    }

    var lazyUserPref;
    function userPreferences() {
      if (!lazyUserPref) lazyUserPref = $injector.get('userPreferences');
      return lazyUserPref;
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

    function setLayout() {
      self.layout = configurator.configurationFor('main').template;
    }

    function loadLayouts() {
      self.layouts = configurator.configurationFor('main').layouts;
      self.layout  = self.layouts[0];
      self.broadcastLayoutChange();
    }

    // When Arethusa is used as widget, it's imperative to wait
    // for this event.
    $rootScope.$on('confLoaded', loadLayouts);

    function layoutLoadedMessage() {
      return [trsls.layoutLoaded.start, self.layout.name, trsls.layoutLoaded.end].join(' ');
    }

    this.broadcastLayoutChange = function() {
      if (self.layout.grid) {
        $timeout(function() {
          notifier.warning('The grid layout is an experimental feature and WILL contain bugs!', 'WARNING');
        }, 1200);
      }
      // Postpone this a bit, so that it doesn't show up as first message - also
      // fixes a little bug with the notification window disappearing too fast on
      // a layout change (as the main html is reloaded with it, the container that
      // shows the notification also reloads)
      $timeout(function() {
        notifier.info(layoutLoadedMessage());
      }, 500);
      $rootScope.$broadcast('layoutChange', self.layout);
    };

    function cycleLayouts() {
      if (self.layouts.length < 2) return;

      var next = self.layouts.indexOf(self.layout) + 1;
      if (next == self.layouts.length) next = 0;
      self.layout = self.layouts[next];
      self.broadcastLayoutChange();
    }

    keyCapture.initCaptures(function(kC) {
      return {
        layout: [
          kC.create('cycle', cycleLayouts, 'l')
        ]
      };
    });

    this.init = function() {
      configure();
      self.addClickAction('disabled', self.defaultClickAction);
      self.setClickAction('disabled', true);
    };

  }
]);
