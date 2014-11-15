"use strict";

angular.module('arethusa.core').directive('helpTrigger', [
  'help',
  'translator',
  'keyCapture',
  function(help, translator, keyCapture) {
    return aG.panelTrigger({
      service: help,
      trsl: translator,
      trslKey: 'help',
      template: '<i class="fa fa-question"/>',
      kC: keyCapture,
      mapping: {
        name: 'help',
        key: 'H'
      }
    });
  }
]);
