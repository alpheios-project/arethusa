"use strict";

var HistoryObj= function(maxSize) {
  this.maxSize = maxSize;
  this.elements = [];
  this.isFull = function() {
    return this.maxSize == this.elements.length;
  };

  this.push = function(obj) {
    if (this.isFull()) {
      this.shift();
    }
    this.elements.push(obj);
  };

  this.shift = function() {
    this.elements.shift();
  };

  this.pop = function() {
    this.elements.pop();
  };

  this.unshift = function(obj) {
    if (this.isFull()) {
      this.pop();
    }
    this.elements.unshift(obj);
  };
};
