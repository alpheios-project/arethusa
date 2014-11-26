'use strict';
angular.module('arethusa.core').directive('pluginSetting', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'templates/arethusa.core/plugin_setting.html'
    };
  }
]);

