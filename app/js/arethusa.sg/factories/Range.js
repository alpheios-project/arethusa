"use strict";

angular.module('arethusa.sg').factory('Range', function() {
  return function(a, b) {
    var self = this;

    // for new Range('1-5')
    try {
      if (a.match(/-/)) {
        a = a.split('-');
      }
    } catch(err) {}

    // for new Range([1, 5])
    if (arethusaUtil.isArray(a)) {
      this.start = a[0];
      this.end   = a[1] || a[0];
    // for new Range(1, 5)
    } else {
      this.start = a;
      this.end   = b || this.start;
    }

    this.start = parseInt(this.start);
    this.end   = parseInt(this.end);
    this.length = this.end - this.start + 1;

    if (this.end < this.start) {
      throw new RangeError('End (' + b + ') is less than start (' + a + ')');
    }

    this.includes = function(integer) {
      return integer >= self.start && integer <= self.end;
    };

    this.includesOtherRange = function(range) {
      return self.includes(range.start) && self.includes(range.end);
    };

    this.sharesElements = function(range) {
      var a = self;
      var b = range;
      return a.includes(b.start) || b.includes(a.start) ||
             a.includes(b.end)   || b.includes(a.end);
    };

    this.take = function(count, startingIndex) {
      if (startingIndex) {
        count = startingIndex + count;
      } else {
        startingIndex = 0;
      }
      var boundary = count > self.length ? self.length : count;
      var res = [];
      for (var i = startingIndex; i < boundary; i++){
        res.push(self.start + i);
      }
      return res;
    };

    this.toString = function() {
      return self.start + '-' + self.end;
    };

    this.toArray = function() {
      var res = [];
      for (var i = self.start; i <= self.end; i++) { res.push(i); }
      return res;
    };
  };
});
