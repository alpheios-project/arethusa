"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.userPreferences
 *
 * @description
 * Provides an API to get and set user preferences.
 *
 * @requires arethusa.core.globalSettings
 * @requires arethusa.core.arethusaLocalStorage
 */
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

    /**
     * @ngdoc function
     * @name arethusa.core.userPreferences#set
     * @methodOf arethusa.core.userPreferences
     *
     * @param {String} category Category under which the preference is stored,
     *   often the name of a plugin
     * @param {String} property Property name of the preference
     * @param {*} value The new preference
     */
    this.set = function(plugin, setting, value) {
      if (globalSettings.persistSettings) {
        set(plugin, setting, value);
      }
    };

    /**
     * @ngdoc function
     * @name arethusa.core.userPreferences#get
     * @methodOf arethusa.core.userPreferences
     *
     * @param {String} category Category under which the preference is stored,
     *   often the name of a plugin
     * @param {String} property Property name of the preference
     *
     * @returns {*} A user preference
     */
    this.get = get;
  }
]);
