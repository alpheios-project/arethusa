"use strict";

var Queue = function(maxSize) {
  this.maxSize = maxSize;
  this.elements = [];
  this.push = function(obj) {
    if (this.maxSize == this.elements.length) {
      this.elements.shift();
    }
    this.elements.push(obj);
  };

};
