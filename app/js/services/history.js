"use strict";

angular.module('arethusa').service('history', function(state, configurator) {
  this.conf = configurator.configurationFor('history');
  this.template = this.conf.template;
  this.maxSize = this.conf.maxSize || 20;

  /* global HistoryObj */
  this.history = new HistoryObj(this.maxSize);
  this.position = 0;

  this.save = function(target, property, oldVal, newVal) {
    this.history.unshift([target, property, oldVal, newVal]);
  };

  this.undo = function() {
    var hist = this.history.elements.shift();
    var obj  = hist[0];
    obj[hist[1]] = hist[2];
  };
});
