"use strict";

angular.module('arethusa.core').service('idHandler', [
  function() {
    this.getId = function(id) {
      return arethusaUtil.formatNumber(id, 4);
    };
  }
]);
