"use strict";

angular.module('arethusa.core').service('userPreferences', [
  'globalSettings',
  'arethusaLocalStorage',
  function(globalSettings, arethusaLocalStorage) {
    var self = this;


    var localStorageKey = 'preferences';

    function key(k) {
      return localStorageKey + '.' + k;
    }

    function set(plugin, setting, value) {
      arethusaLocalStorage.set(key(plugin + '.' + setting), value);
    }

    function get(plugin, setting) {
      return arethusaLocalStorage.get(key(plugin + '.' + setting));
    }

    this.set = function(plugin, setting, value) {
      if (globalSettings.persistSettings) {
        set(plugin, setting, value);
      }
    };

    this.get = get;
  }
]);
