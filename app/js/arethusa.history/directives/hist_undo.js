"use strict";

angular.module('arethusa.history').directive('histUndo', [
  'history',
  'translator',
  function(history, translator) {
    return aG.historyTrigger(history, translator, 'undo');
  }
]);
