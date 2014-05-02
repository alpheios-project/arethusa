"use strict";

var HistoryObj = function(maxSize) {
  this.maxSize = maxSize;
  this.elements = [];
  this.position = 0;

  this.isFull = function() {
    return this.maxSize == this.elements.length;
  };

  this.save = function(event) {
    this.clearObsoleteHistory();
    this.position = 0;
    this.unshift(event);
  };

  this.clearObsoleteHistory = function() {
    this.elements.splice(0, this.position);
  };

  this.undo = function() {
    if (this.canBeUndone()) {
      var event = this.elements[this.position];
      this.position++;
      event.target[event.property] = event.oldVal;
    }
  };

  this.canBeUndone = function() {
    return ! (this.isEmpty() || this.size() === this.position);
  };

  this.redo = function() {
    if (this.canBeRedone()) {
      this.position--;
      var event = this.elements[this.position];
      event.target[event.property] = event.newVal;
    }
  };

  this.canBeRedone = function() {
    return this.position !== 0;
  };

  this.push = function(obj) {
    if (this.isFull()) { this.shift(); }
    this.elements.push(obj);
  };

  this.shift = function() {
    this.elements.shift();
  };

  this.pop = function() {
    this.elements.pop();
  };

  this.unshift = function(obj) {
    if (this.isFull()) { this.pop(); }
    this.elements.unshift(obj);
  };

  this.isEmpty = function() {
    return this.elements.length === 0;
  };

  this.size = function() {
    return this.elements.length;
  };
};
