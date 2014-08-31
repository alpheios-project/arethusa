'use strict';
// deprecated for now
angular.module('arethusa.core').service('locator', [
  '$location',
  function ($location) {
    var noUrlParams;
    var manualParams = {};

    this.get = function(name) {
      return noUrlParams ? manualParams[name] : $location.search()[name];
    };

    this.watchUrl = function(bool) {
      noUrlParams = !bool;
    };

    this.set = function(paramOrParams, value) {
      if (value) {
        manualParams[paramOrParams] = value;
      } else {
        angular.extend(manualParams, paramOrParams);
      }
    };
  }
]);
