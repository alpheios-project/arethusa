"use strict";

angular.module('arethusa.core').service('idHandler', [
  function() {
    this.getId = function(id) {
      return arethusaUtil.formatNumber(id, 4);
    };

    this.formatId = function(id, format) {
      format = format ? format : '%w';
      // in case we have an id formatted like 1-1 here
      var idParts = parseId(id);
      var wId = arethusaUtil.formatNumber(idParts.pop(), 0);
      var sId = arethusaUtil.formatNumber(idParts.pop(), 0);
      return format.replace('%w', wId);
    };

    function parseId(id) {
      return id.split('-');
    }
  }
]);
