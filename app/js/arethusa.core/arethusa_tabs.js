"use strict";

angular.module('arethusa.core').directive('arethusaTabs', [
  'plugins',
  function(plugins) {
    return {
      restrict: 'A',
      scope: {
        tabs: "=arethusaTabs"
      },
      link: function(scope, element, attrs) {
        scope.plugins = plugins;
      },
      templateUrl: 'templates/arethusa.core/arethusa_tabs.html'
    };
  }
]);
