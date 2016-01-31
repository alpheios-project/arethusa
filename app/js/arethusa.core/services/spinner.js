"use strict";

angular.module('arethusa.core').service('spinner', function() {
  var self = this;

  this.spinning = 0;

  this.spin = function() {
    self.spinning++;
  };

  this.stop = function() {
    self.spinning--;
  };
});
