'use strict';
angular.module('arethusa.hist').service('history', [
  'configurator',
  'keyCapture',
  function (configurator, keyCapture) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('history', self);
      self.maxSize = self.maxSize || 20;
    }

    this.undo = function() {
    };

    this.redo = function() {
    };

    keyCapture.initCaptures(function(kC) {
      return {
        history: [
          kC.create('undo', self.undo),
          kC.create('redo', self.redo)
        ]
      };
    });

    this.init = function() {
      configure();
    };

    /* global HistoryObj */
    //var hist = new HistoryObj(this.maxSize);
    //this.history = hist.elements;
    //this.save = function (event) {
      //hist.save(event);
    //};
    //this.undo = function () {
      //hist.undo();
    //};
    //this.canBeUndone = function () {
      //return hist.canBeUndone();
    //};
    //this.redo = function () {
      //hist.redo();
    //};
    //this.canBeRedone = function () {
      //return hist.canBeRedone();
    //};
    //this.catchEvent = this.save;
  }
]);
