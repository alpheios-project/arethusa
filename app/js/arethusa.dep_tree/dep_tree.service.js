"use strict";

angular.module('arethusa.depTree').service('depTree', function(state, configurator) {
  this.conf = configurator.configurationFor('depTree');
  this.template = this.conf.template;
  this.main = this.conf.main;

  this.init = function() {
  };
});
