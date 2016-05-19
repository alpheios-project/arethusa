'use strict';
// deprecated for now
// but still in use, no?

/**
 * This service wraps url parameters for routed views and
 * provides a unified access to url- and manually-set parameters
 */
angular.module('arethusa.core').service('locator', [
  '$location',
  function ($location) {
    var noUrlParams;
    var manualParams = {};

    /**
     * Acess parameters by name
     * @param name
     * @returns {*}
       */
    this.get = function(name) {
      return noUrlParams ? manualParams[name] : $location.search()[name];
    };

    /**
     * Toggle url- or manually-set parameters
     * @param bool
       */
    this.watchUrl = function(bool) {
      noUrlParams = !bool;
    };

    /**
     * Manually set parameters.
     * @param paramOrParams
     * @param value
       */
    this.set = function(paramOrParams, value) {
      if (value) {
        manualParams[paramOrParams] = value;
      } else {
        angular.extend(manualParams, paramOrParams);
      }
    };
  }
]);
