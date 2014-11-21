"use strict";

angular.module('arethusa.core').directive('globalSettingsTrigger', [
  'generator',
  'globalSettings',
  'translator',
  'keyCapture',
  function(generator, globalSettings, translator, keyCapture) {
    return generator.panelTrigger({
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
