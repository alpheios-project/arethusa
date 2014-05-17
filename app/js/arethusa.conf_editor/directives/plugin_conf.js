"use strict";

angular.module('arethusa.confEditor').directive('pluginConf', function() {
  return {
    restrict: 'AE',
    scope: true,
    link: function(scope, element, attrs) {
      var name = scope.$eval(attrs.name);

      // Right now paths to such configuration are hardcoded to a specific
      // folder. This will be much more dynamic in the future.
      scope.template = 'templates/configs/' + name + '.html';
    },
    templateUrl: 'templates/plugin_conf.html'
  };
});
