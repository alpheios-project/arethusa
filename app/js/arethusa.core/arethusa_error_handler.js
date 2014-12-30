"use strict";

angular.module('arethusa.core').service('arethusaErrorHandler', [
  '$log',
  function($log) {
    var listeners = [];

    function register(fn) {
      listeners.push(fn);
    }

    function deregisterFn(fn) {
      return function() {
        listeners.splice(listeners.indexOf(fn), 1);
      };
    }

    // Add debouncing as a second argument for this
    this.listen = function(fn) {
      register(fn);
      return deregisterFn(fn);
    };

    this.log = function(exception, cause) {
      angular.forEach(listeners, function(listener) {
        listener(exception, cause);
      });
      $log.error.apply($log, arguments);
    };
  }
]);
