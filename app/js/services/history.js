"use strict";

angular.module('arethusa').service('history', function(configurator) {
  this.conf = configurator.configurationFor('history');
  this.template = this.conf.template;
  this.maxSize = this.conf.maxSize || 20;

  /* global HistoryObj */
  var hist = new HistoryObj(this.maxSize);

  /* If the history is triggered by a watch, undo/redo will immediately
   * fire another event once it's done - it's just another change after
   * all. That's not helpful for our cause though, we therefore skip one
   * digest cycle and make changes without propagating the second change
   * to history. The event still fires - others might want to listen. */
  var skipCycle = false;

  this.history = hist.elements;

  this.save = function(event) {
    if (skipCycle) {
      skipCycle = false;
    } else {
      hist.save(event);
    }
  };

  this.undo = function() {
    skipCycle = true;
    hist.undo();
  };

  this.canBeUndone = function() {
    return hist.canBeUndone();
  };

  this.redo = function() {
    skipCycle = true;
    hist.redo();
  };

  this.canBeRedone = function() {
    return hist.canBeRedone();
  };
});
