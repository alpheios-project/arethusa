"use strict";

angular.module('arethusa.core').service('arethusaLocalStorage', [
  'localStorageService',
  function(localStorageService) {
    this.get = function(key) {
      return coerce(localStorageService.get(key));
    };

    this.set = localStorageService.set;

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
