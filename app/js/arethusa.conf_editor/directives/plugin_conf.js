"use strict";

angular.module('arethusa.confEditor').directive('pluginConf', function() {
  return {
    restrict: 'AE',
    scope: true,
    link: function(scope, element, attrs) {
      var name = scope.$eval(attrs.name);
      scope.template = 'templates/configs/' + name + '.html';
    },
    templateUrl: 'templates/plugin_conf.html'
  };
});
