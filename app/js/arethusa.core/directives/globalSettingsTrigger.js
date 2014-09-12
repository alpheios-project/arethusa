"use strict";

angular.module('arethusa.core').directive('globalSettingsTrigger', [
  'globalSettings',
  'translator',
  function(globalSettings, translator) {
    return aG.panelTrigger(
      globalSettings, translator, 'globalSettings.title', '<i class="fi-widget"/>'
    );
  }
]);
