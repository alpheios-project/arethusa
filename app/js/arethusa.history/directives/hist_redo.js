"use strict";

angular.module('arethusa.history').directive('histRedo', [
  'history',
  'translator',
  function(history, translator) {
    return aG.historyTrigger(history, translator, 'redo', 'repeat');
  }
]);

