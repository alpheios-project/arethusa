"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.globalSettings
 *
 * @description
 * Service to define and manipulate application-wide settings.
 *
 * @requires arethusa.core.configurator
 * @requires arethusa.core.plugins
 * @requires $injector
 * @requires $rootScope
 * @requires arethusa.core.notifier
 * @requires arethusa.core.translator
 * @requires arethusa.core.keyCapture
 * @requires $timeout
 */
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

    /**
     * @ngdoc property
     * @name colorizers
     * @propertyOf arethusa.core.globalSettings
     *
     * @description
     * Dictionary of usable colorizers, registered through {@link arethusa.core.globalSettings#methods_addColorizer globalSettings.addColorizer}.
     *
     * Colorizers are used to add styling to tokens through the functions
     * {@link arethusa.core.state#methods_addStyle state.addStyle},
     * {@link arethusa.core.state#methods_removeStyle state.removeStyle} and
     * {@link arethusa.core.state#methods_unsetStyle state.unsetStyle}.
     * Before plugins use one of these functions, they typically need to ask
     * if they are the currently active colorizer through {@link arethusa.core.globalSettings#methods_isColorizer globalSettings.isColorizer}.
     *
     * A plugin **NEEDS** to define two public functions to function as a colorizer:
     *
     * - *applyStyling*
     *
     *    This function is called when a colorizer is changed on the fly and all tokens
     *    needs to be recolored.
     *
     * - *colorMap*
     *
     *    Function called to produce a color legend so that users can look up the
     *    meaning of a colorization scheme.
     *    The markup of a colorMap object shall be as follows:
     *    ```
     *      // TODO
     *    ```
     *
     * The values in this dictionary are irrelevant, we use a dictionary only for fast lookups.
     *
     * Comes with the standard option to disable colorization altogether.
     *
     * Used by the {@link arethusa.core.directive:colorizerSetting colorizerSetting}
     * directive to allow the user to choose a colorizer.
     *
     */
    self.colorizers = { disabled: true };

    var trsls = translator({
      'globalSettings.layoutLoaded' : 'layoutLoaded'
    });

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

    self.settings = {};
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

    /**
     * @ngdoc function
     * @name arethusa.core.globalSettings#addClickAction
     * @methodOf arethusa.core.globalSettings
     *
     * @description
     * Adds a handler to the selection of available click handlers.
     *
     * @param {String} name Name of the click action handler.
     * @param {Function} clickAction Callback to be executed when a click is made.
     * @param {Object} [preClickActions] Optional object to hold functions to be
     *   executed on `mouseenter` and `mouseleave`, i.e. prior to a possible
     *   click action. Keys have to be the event names, values the callback functions.
     */
    this.addClickAction = function(name, fn, preFn) {
      self.clickActions[name] = [fn, preFn];
    };

    /**
     * @ngdoc function
     * @name arethusa.core.globalSettings#removeClickAction
     * @methodOf arethusa.core.globalSettings
     *
     * @description
     * Removes a click action handler from the selection of available click
     * action handlers.
     *
     * When the removed handler was currently active, the click action is disabled.
     *
     * @param {String} name Name of the click action handler.
     */
    this.removeClickAction = function(name) {
      delete self.clickActions[name];
      if (self.clickAction === name) self.setClickAction('disabled');
    };

    /**
     * @ngdoc function
     * @name arethusa.core.globalSettings#setClickAction
     * @methodOf arethusa.core.globalSettings
     *
     * @description
     * Sets the active click action handler.
     *
     * @param {String} name Name of the click action handler.
     * @param {Boolean} [silent=false] Determines if the `clickActionChange`
     *   event should be supressed.
     */
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

    /**
     * @ngdoc function
     * @name arethusa.core.globalSettings#addColorizer
     * @methodOf arethusa.core.globalSettings
     *
     * @description
     * Function to register a plugin as colorizer (cf. {@link arethusa.core.globalSettings#properties_colorizers globalSettings.colorizers}).
     *
     * @param {String} plugin Name of the colorizing plugin.
     */
    this.addColorizer = function(pluginName) {
      self.colorizers[pluginName] = true;
    };

    /**
     * @ngdoc function
     * @name arethusa.core.globalSettings#isColorizer
     * @methodOf arethusa.core.globalSettings
     *
     * @param {String} plugin Name of a plugin.
     *
     * @returns {Boolean} Whether a plugin is the active colorizer or not.
     */
    this.isColorizer = function(pluginName) {
      return self.colorizer === pluginName;
    };

    /**
     * @ngdoc function
     * @name arethusa.core.globalSettings#applyColorizer
     * @methodOf arethusa.core.globalSettings
     *
     * @description
     * TODO
     */
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

    /**
     * @ngdoc function
     * @name arethusa.core.globalSettings#colorMaps
     * @methodOf arethusa.core.globalSettings
     *
     * @description
     * TODO
     */
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
        notifier.info(trsls.layoutLoaded({ layout: self.layout.name }));
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
