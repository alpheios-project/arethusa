"use strict";

angular.module('arethusa').service('history', function(configurator) {
  this.conf = configurator.configurationFor('history');
  this.template = this.conf.template;
  this.maxSize = this.conf.maxSize || 20;

  /* global HistoryObj */
  this.history = new HistoryObj(this.maxSize);
  this.position = 0;

  this.save = function(event) {
    this.history.unshift(event);
  };

  this.undo = function() {
    var event= this.history.elements.shift();
    var obj  = event.target;
    obj[event.property] = event.oldVal;
  };
});
