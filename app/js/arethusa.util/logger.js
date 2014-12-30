'use strict';
/* global console */

/**
 * @ngdoc service
 * @name arethusa.util.logger
 *
 * @description
 * Simple logging wrapper.
 *
 */
angular.module('arethusa.util').service('logger', [
  'configurator',
  function(configurator) {
    var conf = configurator.configurationFor('logger');
    var resource = configurator.provideResource(conf.resource);

    /**
     * @ngdoc function
     * @name arethusa.util.logger#log
     * @methodOf arethusa.util.logger
     *
     * @description
     * Wrapper around `console.log`
     *
     * @param {String} msg Message to log
     *
     */
    this.log = function(msg) {
      console.log(msg);
    };

    this.remoteLog = function(msg) {
      if (resource) {
        resource.post(msg, 'text/plain');
      }
    };
  }
]);
