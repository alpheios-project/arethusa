'use strict';
angular.module('arethusa.hist').service('history', [
  'configurator',
  function (configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('history', self);
      self.maxSize = self.maxSize || 20;
    }

    this.init = function() {
      configure();
    };

    /* global HistoryObj */
    var hist = new HistoryObj(this.maxSize);
    this.history = hist.elements;
    this.save = function (event) {
      hist.save(event);
    };
    this.undo = function () {
      hist.undo();
    };
    this.canBeUndone = function () {
      return hist.canBeUndone();
    };
    this.redo = function () {
      hist.redo();
    };
    this.canBeRedone = function () {
      return hist.canBeRedone();
    };
    this.catchEvent = this.save;
  }
]);
