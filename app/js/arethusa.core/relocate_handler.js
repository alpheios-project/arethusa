"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.relocateHandler
 *
 * @description
 * Allows relocating between base deployments of the application
 *
 * Needs to be defined in a configuration file and uses the following format
 *
 * ```
 *   "relocateHandler" : {
 *     "location1": {
 *       "baseUrl" : "http path to the base deployment location"
 *     },
 *      ...
 *     "locationN": {
 *       "baseUrl" : "http path to the base deployment location"
 *      }
 *   }
 * ```
 *
 * @requires $location
 * @requires $window
 * @requires arethusa.core.configurator
 *
 */

angular.module('arethusa.core').service('relocateHandler', [
  "$location",
  "$window",
  "configurator",
  "$analytics",
  function($location, $window, configurator, $analytics) {
    var self = this;


    var conf = configurator.configurationFor('relocateHandler') || {};

    // when it's not configured, we don't do anything
    this.defined = !angular.equals({}, conf);
    this.locations = this.defined ? Object.keys(conf) : [];

    function relocateUrl(key) {
      var base = conf[key].baseUrl;
      var currentUrl = $location.url();
      return base + currentUrl;
    }


    /**
     * @ngdoc function
     * @name arethusa.core:relocateHandler#relocate
     * @methodOf arethusa.core.relocateHandler
     *
     * @description
     * Relocates arethusa to the configured base url
     *
     * @param {string} loc The key to the location.
     * @param {string} [targetWin='_self'] The target window.
     */
    this.relocate = function(loc, targetWin) {
      $analytics.eventTrack('relocate', {
        category: 'actions', label: loc
      });

      targetWin = targetWin || '_self';
      $window.open(relocateUrl(loc), targetWin);
    };
  }
]);
