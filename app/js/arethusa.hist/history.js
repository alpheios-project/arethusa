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

    function saveEvent(event) {
      self.events.unshift(event);
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
