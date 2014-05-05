"use strict";

angular.module('arethusa').service('text', function(state, configurator) {
  this.conf = configurator.configurationFor('text');
  this.template = this.conf.template;
  this.main = this.conf.main;
});
