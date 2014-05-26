"use strict";

angular.module('arethusa.exercise').service('instructor', function(fillInTheBlank, configurator) {
  var self = this;
  this.conf = configurator.configurationFor('instructor');
  this.template = this.conf.template;
  this.name = this.conf.name;

  this.started = false;
  this.start = function() {
    // Track time here
    self.startedAt = new Date();
    fillInTheBlank.started = true;
    self.started = true;
  };

  this.stop = function() {
    // stop time tracking
    self.stoppedAt = new Date();
    self.started = false;
    self.done = true;
  };

  this.timeElapsed = function() {
    return Math.abs(self.stoppedAt - self.startedAt);
  };

  var aU = arethusaUtil;
  this.timeElapsedFormatted = function() {
    var t = self.timeElapsed() / 60;
    var minutes = t / 60;
    var seconds = t % minutes;

    return aU.formatNumber(minutes, 2) + ':' + aU.formatNumber(seconds, 2);
  };

  this.init = function() {
    self.started = false;
    self.done = false;
    self.startedAt = false;
    self.stoppedAt = false;
    self.report = {};
  };
});
