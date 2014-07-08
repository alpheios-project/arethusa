"use strict";

angular.module('arethusa.core').service('idHandler', [
  function() {
    var self = this;

    this.getId = function(id) {
      return arethusaUtil.formatNumber(id, 4);
    };

    this.formatId = function(id, format) {
      if (!id) return;

      format = format ? format : '%w';
      // in case we have an id formatted like 1-1 here
      var idParts = parseId(id);
      var wId = arethusaUtil.formatNumber(idParts.pop(), 0);
      var sId = arethusaUtil.formatNumber(idParts.pop(), 0);
      return format.replace('%w', wId);
    };

    this.decrement = function(id) {
      var idParts = parseId(id);
      var wId = idParts.pop();
      var wParts = /(\d*)(\w*)?/.exec(wId);
      var newWId = wParts[1] - 1;
      return self.getId(newWId) + (wParts[2] || '');
    };

    function parseId(id) {
      return id.split('-');
    }
  }
]);
