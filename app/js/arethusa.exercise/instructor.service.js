"use strict";

angular.module('arethusa.exercise').service('instructor', function(fillInTheBlank, configurator) {
  var self = this;
  this.conf = configurator.configurationFor('instructor');
  this.template = this.conf.template;
  this.name = this.conf.name;
});
