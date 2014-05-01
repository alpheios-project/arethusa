"use strict";

angular.module('arethusa').service('history', function(state, configurator) {
  this.conf = configurator.configurationFor('history');
  this.template = this.conf.template;
});
