"use strict";

angular.module('arethusa.core').directive('helpTrigger', [
  'help',
  'translator',
  function(help, translator) {
    return aG.panelTrigger(
      help, translator, 'help', '<i class="fa fa-question"/>'
    );
  }
]);
