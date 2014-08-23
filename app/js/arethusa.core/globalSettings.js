"use strict";

angular.module('arethusa.core').service('globalSettings', [
  'configurator',
  function(configurator) {
    var self = this;

    var confKeys = [
      "alwaysDeselect"
    ];

    function configure() {
      self.conf = configurator.configurationFor('main').globalSettings || {};
      configurator.delegateConf(self, confKeys, true); // true makes them sticky

      self.settings = {};
      defineSettings();
    }

    function Conf(property, type) {
      this.property = property;
      this.label = "globalSettings." + property;
      this.type = type || 'checkbox';
    }

    function defineSettings(args) {
      defineSetting('alwaysDeselect');

    }

    function defineSetting(property, type) {
      self.settings[property] = new Conf(property, type);
    }

    this.toggle = function() {
      self.active = !self.active;
    };

    configure();
  }
]);
