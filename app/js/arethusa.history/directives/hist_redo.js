"use strict";

angular.module('arethusa.history').directive('histRedo', [
  'generator',
  'history',
  'translator',
  function(generator, history, translator) {
    return generator.historyTrigger(history, translator, 'redo', 'repeat');
  }
]);

