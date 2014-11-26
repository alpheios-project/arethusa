"use strict";

angular.module('arethusa.core').service('arethusaLocalStorage', [
  'localStorageService',
  function(localStorageService) {
    this.get = localStorageService.get;
    this.set = localStorageService.set;
  }
]);
