"use strict";

angular.module('arethusa.core').directive('globalSettingsTrigger', [
  'globalSettings',
  'translator',
  function(globalSettings, translator) {
    return aG.panelTrigger({
      service: globalSettings,
      trsl: translator,
      trslKey: 'globalSettings.title',
      template: '<i class="fi-widget"/>'
    });
  }
]);
