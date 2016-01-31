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
  function() {
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
  }
]);
