"use strict";

angular.module('arethusa.exercise').service('instructor', function(fillInTheBlank, configurator) {
  var self = this;
  this.conf = configurator.configurationFor('instructor');
  this.template = this.conf.template;
  this.name = this.conf.name;

  this.started = false;
  this.start = function() {
    // Track time here
    fillInTheBlank.started = true;
    self.started = true;
  };

  this.stop = function() {
    // stop time tracking
    self.started = false;
  };
});
