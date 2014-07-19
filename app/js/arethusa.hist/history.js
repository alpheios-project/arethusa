'use strict';
angular.module('arethusa.hist').service('history', [
  'configurator',
  'keyCapture',
  'state',
  function (configurator, keyCapture, state) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('history', self);
      self.maxSize = self.maxSize || 20;
    }

    this.undo = function() {
      if (self.canUndo) {

      }
    };

    this.redo = function() {
      if (self.canRedo) {

      }
    };

    keyCapture.initCaptures(function(kC) {
      return {
        history: [
          kC.create('undo', self.undo),
          kC.create('redo', self.redo)
        ]
      };
    });

    state.watch('*', function(n, o, event) {
      self.events.unshift(event);
    });

    this.init = function() {
      configure();
      self.canRedo = false;
      self.canUndo = false;
      self.events = [];
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
