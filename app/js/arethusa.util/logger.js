'use strict';
/* global console */

angular.module('arethusa.util').service('logger', [
  function() {
    this.log = function(msg) {
      console.log(msg);
    };
  }
]);
