"use strict";

angular.module('arethusa.core').provider('$exceptionHandler', {
  $get: function(arethusaErrorHandler) {
    return arethusaErrorHandler.log;
  }
});
