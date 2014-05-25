"use strict";

angular.module('arethusa.search').service('search', function(state, configurator) {
  this.conf = configurator.configurationFor('search');
  this.name = this.conf.name;
  this.template = this.conf.template;
});
