"use strict";

angular.module('arethusa.sg').factory('Range', function() {
  return function(a, b) {
    var self = this;

    if (b < a) {
      throw new RangeError('End (' + b + ') is less than start (' + a + ')');
    }

    this.start = a;
    this.end   = b || a;

    var s = a - 1;
    var e = b + 1;

    this.includes = function(integer) {
      return integer > s && integer < e;
    };

    this.includesOtherRange = function(range) {
      return self.includes(range.start) && self.includes(range.end);
    };
  };
});
