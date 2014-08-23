'use strict';
angular.module('arethusa.core').directive('plugin', [
  'plugins',
  function (plugins) {
    return {
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
        scope.name   = attrs.name;
        scope.plugin = plugins.get(scope.name);

        scope.$on('pluginAdded', function(event, name, plugin) {
          if (name === scope.name) {
            scope.plugin = plugin;
          }
        });
      },
      template: '<div id="{{ plugin.name }}" ng-include="plugin.template"></div>'
    };
  }
]);
