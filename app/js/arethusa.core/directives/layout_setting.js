"use strict";

angular.module('arethusa.core').directive('layoutSetting', [
  'globalSettings',
  function(globalSettings) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.gS = globalSettings;
        scope.setting = globalSettings.settings.layout;
      },
      templateUrl: 'templates/arethusa.core/layout_setting.html'
    };
  }
]);
