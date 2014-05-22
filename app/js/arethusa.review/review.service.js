"use strict";

angular.module('arethusa.review').service('review', function(configurator) {
  var self = this;

  this.conf = configurator.configurationFor('review');
  this.template = this.conf.template;
  this.name = this.conf.name;
});
