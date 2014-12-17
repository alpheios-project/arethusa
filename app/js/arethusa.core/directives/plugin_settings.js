'use strict';

/**
 * @ngdoc directive
 * @name arethusa.core.directive:pluginSettings
 * @restrict A
 *
 * @description
 * Iterates over a plugin's `settings` array of {@link arethusa.util.commons#methods_setting settings}.
 *
 * Either renders the default {@link arethusa.core.directive:pluginSetting pluginSetting}
 * directive or a custom directive. (cf. {@link arethusa.util.commons#methods_setting commons.setting}).
 *
 * Awaits the `plugin` scope variable to be present.
 *
 */

angular.module('arethusa.core').directive('pluginSettings', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'templates/arethusa.core/plugin_settings.html'
    };
  }
]);
