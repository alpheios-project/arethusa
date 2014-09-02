'use strict';
angular.module('arethusa.core').directive('plugin', [
  'plugins',
  function (plugins) {
    return {
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
        var nameMap = {
          'aT' : 'artificialToken',
          'SG' : 'sg'
        };

        scope.name = nameMap[attrs.name] || attrs.name;
        scope.plugin = plugins.get(scope.name);

        scope.$on('pluginAdded', function(event, name, plugin) {
          if (name === scope.name) {
            scope.plugin = plugin;
          }
        });
      },
      template: '<div id="{{ plugin.name }}" class="fade very-slow" ng-include="plugin.template"></div>'
    };
  }
]);
