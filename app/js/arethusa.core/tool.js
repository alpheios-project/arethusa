"use strict";

angular.module('arethusa.core').factory('Tool', [
  function() {
    return function(args) {
      this.uri     = args.uri;
    };
  }
]);
