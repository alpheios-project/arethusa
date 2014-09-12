'use strict';
angular.module('arethusa.core').directive('pluginSettings', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'templates/arethusa.core/plugin_settings.html'
    };
  }
]);
