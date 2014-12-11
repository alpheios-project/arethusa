'use strict';

/**
 * @ngdoc directive
 * @name arethusa.core.directives:plugin
 * @restrict AE
 * @scope
 *
 * @description
 * Renders a plugin, identified by the plugin's name.
 *
 * The template found in the plugins `template` property is used to do this.
 *
 * The plugin itself is bound to the newly created child scope. Templates can
 * access it through the `plugin` scope variable.
 *
 * @param {string} plugin The name of the plugin used in this scope.
 * @param {boolean} [withSettings=false] Determines if the template should
 *   include plugin settings through the use of the {@link arethusa.core.directives:pluginSettings pluginSettings}
 *   directive.
 *
 * @requires plugins
 */
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
