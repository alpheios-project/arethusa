'use strict';
angular.module('arethusa.hist').service('history', [
  'configurator',
  function (configurator) {
    this.conf = configurator.configurationFor('history');
    this.template = this.conf.template;
    this.maxSize = this.conf.maxSize || 20;
    this.main = this.conf.main;
    this.listener = this.conf.listener;
    this.name = this.conf.name;
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