'use strict';
angular.module('arethusa.confEditor').directive('pluginConf', function () {
  return {
    restrict: 'AE',
    scope: true,
    link: function (scope, element, attrs) {
      // Right now paths to such configuration are hardcoded to a specific
      // folder. This will be much more dynamic in the future.
      scope.name = scope.$eval(attrs.name);
      scope.conf = scope.pluginConf(scope.name);
      scope.template = 'js/templates/configs/' + scope.name + '.html';
    },
    templateUrl: 'js/conf_editor/templates/plugin_conf.html'
  };
});