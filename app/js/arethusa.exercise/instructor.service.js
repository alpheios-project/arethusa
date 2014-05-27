"use strict";

angular.module('arethusa.exercise').service('instructor', function(fillInTheBlank, configurator) {
  var self = this;
  this.conf = configurator.configurationFor('instructor');
  this.template = this.conf.template;
  this.name = this.conf.name;

  this.started = false;
  this.start = function() {
    self.startedAt = new Date();
    fillInTheBlank.started = true;
    self.started = true;
  };

  this.stop = function() {
    self.stoppedAt = new Date();
    self.started = false;
    self.report = fillInTheBlank.validate();
    self.time = self.timeElapsedFormatted();
    self.done = true;
  };

  this.timeElapsed = function() {
    return Math.round(self.stoppedAt - self.startedAt);
  };

  var aU = arethusaUtil;
  this.timeElapsedFormatted = function() {
    var t = Math.round(self.timeElapsed() / 1000);
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
