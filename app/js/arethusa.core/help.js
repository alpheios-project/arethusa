"use strict";

angular.module('arethusa.core').service('help', [
  function() {
    var self = this;

    this.toggle = function() {
      self.active = !self.active;
    };

    self.active = false;
  }
]);
