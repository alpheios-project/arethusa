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
      trslKey: 'credits',
      template: '<i class="fa" translate="credits"></i>'
    });
  }
]);
