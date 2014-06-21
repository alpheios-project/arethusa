"use strict";

angular.module('arethusa.sg').factory('Range', function() {
  return function(a, b) {
    var self = this;

    if (arethusaUtil.isArray(a)) {
      this.start = a[0];
      this.end   = a[1] || a[0];
    } else {
      this.start = a;
      this.end   = b || this.start;
    }

    this.start = parseInt(this.start);
    this.end   = parseInt(this.end);

    if (this.end < this.start) {
      throw new RangeError('End (' + b + ') is less than start (' + a + ')');
    }

    var s = a - 1;
    var e = b + 1;

    this.includes = function(integer) {
      return integer > s && integer < e;
    };

    this.includesOtherRange = function(range) {
      return self.includes(range.start) && self.includes(range.end);
    };

    this.hasOverlaps = function(range) {
      return (!self.includesOtherRange(range)) && self.sharesElements(range);
    };

    this.sharesElements = function(range) {
      return self.includes(range.start) || self.includes(range.end);
    };
  };
});
