"use strict";

angular.module('arethusa.core').directive('helpTrigger', [
  'help',
  'translator',
  function(help, translator) {
    return aG.panelTrigger({
      service: help,
      trsl: translator,
      trslKey: 'help',
      template: '<i class="fa fa-question"/>'
    });
  }
]);
