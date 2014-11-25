"use strict";

angular.module('arethusa.core').directive('helpTrigger', [
  'generator',
  'help',
  'translator',
  'keyCapture',
  function(generator, help, translator, keyCapture) {
    return generator.panelTrigger({
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
