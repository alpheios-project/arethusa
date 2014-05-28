'use strict';
angular.module('arethusa.exercise').service('instructor', [
  'fillInTheBlank',
  'configurator',
  function (fillInTheBlank, configurator) {
    var self = this;
    function configure() {
      configurator.getConfAndDelegate('instructor', self);
    }
    configure();
    this.start = function () {
      self.startedAt = new Date();
      fillInTheBlank.started = true;
      self.started = true;
    };
    this.stop = function () {
      self.stoppedAt = new Date();
      self.started = false;
      self.report = fillInTheBlank.validate();
      self.time = self.timeElapsedFormatted();
      self.done = true;
    };
    this.timeElapsed = function () {
      return Math.round(self.stoppedAt - self.startedAt);
    };
    var aU = arethusaUtil;
    this.timeElapsedFormatted = function () {
      var t = Math.round(self.timeElapsed() / 1000);
      var minutes = t / 60;
      var seconds = t % minutes;
      return aU.formatNumber(minutes, 2) + ':' + aU.formatNumber(seconds, 2);
    };
    function reset() {
      self.done = false;
      self.startedAt = false;
      self.stoppedAt = false;
      self.report = {};
    }
    this.init = function () {
      configure();
      reset();
    };
  }
]);