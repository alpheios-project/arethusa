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

    var silence = false;

    function doSilent(fn) {
      silence = true;
      fn();
      silence = false;
      checkAvailability();
    }

    this.undo = function() {
      if (self.canUndo) {
        doSilent(function() {
          current().undo();
          self.position++;
        });
      }
    };

    this.redo = function() {
      if (self.canRedo) {
        doSilent(function() {
          self.position--;
          current().exec();
        });
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

    function current() {
      return self.events[self.position];
    }

    function saveEvent(event) {
      if (!silence) self.events.unshift(event);
      checkAvailability();
    }

    function checkAvailability() {
      var any = self.events.length > 0;
      self.canUndo = any && self.position < self.events.length;
      self.canRedo = any && self.position > 0;
    }

    state.watch('*', function(n, o, event) {
      saveEvent(event);
    });

    this.init = function() {
      configure();
      self.canRedo = false;
      self.canUndo = false;
      self.events = [];
      self.position = 0;
    };
  }
]);
