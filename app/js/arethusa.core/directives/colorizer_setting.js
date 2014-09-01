"use strict";

angular.module('arethusa.core').directive('colorizerSetting', [
  'globalSettings',
  function(globalSettings) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.gS = globalSettings;
        scope.setting = globalSettings.settings.colorizer;
      },
      templateUrl: 'templates/arethusa.core/colorizer_setting.html'
    };
  }
]);
