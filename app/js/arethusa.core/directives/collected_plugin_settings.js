"use strict";

angular.module('arethusa.core').directive('collectedPluginSettings', [
  'plugins',
  function(plugins) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.plugins = plugins;
      },
      templateUrl: 'templates/arethusa.core/collected_plugin_settings.html'
    };
  }
]);
