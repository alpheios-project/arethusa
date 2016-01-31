"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.arethusaLocalStorage
 *
 * @description
 * Arethusa's API to communicate with `localStorage`. All values stored are
 * prefixed with `arethusa.`.
 *
 * Performs type coercion upon retrieval for Booleans, so that `true`, `false`
 * and `null` can be used properly.
 *
 * @requires localStorageService
 */
angular.module('arethusa.core').service('arethusaLocalStorage', [
  'localStorageService',
  function(localStorageService) {
    /**
     * @ngdoc function
     * @name arethusa.core.arethusaLocalStorage#get
     * @methodOf arethusa.core.arethusaLocalStorage
     *
     * @param {String} key The key
     * @returns {*} The stored value
     */
    this.get = function(key) {
      return coerce(localStorageService.get(key));
    };

    /**
     * @ngdoc function
     * @name arethusa.core.arethusaLocalStorage#set
     * @methodOf arethusa.core.arethusaLocalStorage
     *
     * @param {String} key The key
     * @param {*} value The value
     */
    this.set = localStorageService.set;

    this.keys = localStorageService.keys;

    var JSONBooleans = ['true', 'false', 'null'];
    function coerce(value) {
      if (JSONBooleans.indexOf(value) === -1) {
        return value;
      } else {
        return JSON.parse(value);
      }
    }
  }
]);
