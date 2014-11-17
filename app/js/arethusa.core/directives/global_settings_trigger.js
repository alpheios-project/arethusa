"use strict";

angular.module('arethusa.core').directive('globalSettingsTrigger', [
  'globalSettings',
  'translator',
  'keyCapture',
  function(globalSettings, translator, keyCapture) {
    return aG.panelTrigger({
      service: globalSettings,
      trsl: translator,
      trslKey: 'globalSettings.title',
      template: '<i class="fi-widget"/>',
      kC: keyCapture,
      mapping: {
        name: 'globalSettings',
        key:  'S'
      }
    });
  }
]);
