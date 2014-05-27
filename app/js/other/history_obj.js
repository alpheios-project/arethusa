'use strict';
var HistoryObj = function (maxSize) {
  this.maxSize = maxSize;
  this.elements = [];
  this.position = 0;
  this.lastEvent = null;
  this.setLastEvent = function (event) {
    this.lastEvent = event;
  };
  this.isFull = function () {
    return this.maxSize == this.elements.length;
  };
  // We don't want to save an undo/redo event to the history. This
  // can be fired if the history is triggered by an angular directive
  // that uses a $watch, which would immediately fire again, if undo/redo
  // is applied.
  this.save = function (event) {
    if (!this.eventUndoneOrRedone(event)) {
      this.clearObsoleteHistory();
      this.position = 0;
      this.setLastEvent(event);
      this.unshift(event);
    }
  };
  this.eventUndoneOrRedone = function (event) {
    if (this.lastEvent) {
      return this.lastEvent.target === event.target && this.lastEvent.property === event.property && (this.lastEvent.oldVal === event.newVal && this.lastEvent.newVal === event.oldVal || this.lastEvent.oldVal === event.oldVal && this.lastEvent.newVal === event.newVal);
    }
  };
  this.clearObsoleteHistory = function () {
    this.elements.splice(0, this.position);
  };
  this.undo = function () {
    if (this.canBeUndone()) {
      var event = this.elements[this.position];
      this.position++;
      event.target[event.property] = event.oldVal;
    }
  };
  this.canBeUndone = function () {
    return !(this.isEmpty() || this.size() === this.position);
  };
  this.redo = function () {
    if (this.canBeRedone()) {
      this.position--;
      var event = this.elements[this.position];
      event.target[event.property] = event.newVal;
    }
  };
  this.canBeRedone = function () {
    return this.position !== 0;
  };
  this.push = function (obj) {
    if (this.isFull()) {
      this.shift();
    }
    this.elements.push(obj);
  };
  this.shift = function () {
    this.elements.shift();
  };
  this.pop = function () {
    this.elements.pop();
  };
  this.unshift = function (obj) {
    if (this.isFull()) {
      this.pop();
    }
    this.elements.unshift(obj);
  };
  this.isEmpty = function () {
    return this.elements.length === 0;
  };
  this.size = function () {
    return this.elements.length;
  };
};