"use strict";

angular.module('arethusa.history').directive('histUndo', [
  'generator',
  'history',
  'translator',
  function(generator, history, translator) {
    return generator.historyTrigger(history, translator, 'undo');
  }
]);
