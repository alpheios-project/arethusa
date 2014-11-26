"use strict";

angular.module('arethusa.core').service('arethusaLocalStorage', [
  'localStorageService',
  function(localStorageService) {
    var self = this;

    this.get = localStorageService.get;
    this.set = localStorageService.set;
  }
]);
