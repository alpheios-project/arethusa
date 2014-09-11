"use strict";

angular.module('arethusa.core').directive('allMessagesTrigger', [
  'notifier',
  'translator',
  function(notifier, translator) {
    return aG.panelTrigger(
      notifier, translator, 'messages', '<i class="fi-mail"/>'
    );
  }
]);
