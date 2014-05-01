"use strict";

angular.module('arethusa').service('history', function(state, configurator) {
  this.conf = configurator.configurationFor('history');
  this.template = this.conf.template;
  this.maxSize = this.conf.maxSize || 20;
  /* global HistoryObj */
  this.history = new HistoryObj(this.maxSize);
});
