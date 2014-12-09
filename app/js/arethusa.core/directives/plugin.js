'use strict';
angular.module('arethusa.core').directive('plugin', [
  'plugins',
  function (plugins) {
    return {
      restrict: 'AE',
      scope: true,
      link: function (scope, element, attrs) {
        var nameMap = {
          'aT' : 'artificialToken',
          'SG' : 'sg'
        };

        scope.name = nameMap[attrs.name] || attrs.name;
        scope.plugin = plugins.get(scope.name);
        scope.withSettings = attrs.withSettings;

        scope.$on('pluginAdded', function(event, name, plugin) {
          if (name === scope.name) {
            scope.plugin = plugin;
          }
        });
      },
      templateUrl: 'templates/arethusa.core/plugin.html'
    };
  }
]);
