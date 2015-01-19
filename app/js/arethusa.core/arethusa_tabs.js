"use strict";

angular.module('arethusa.core').directive('arethusaTabs', [
  'plugins',
  'state',
  function(plugins,state) {
    return {
      restrict: 'A',
      scope: {
        tabs: "=arethusaTabs"
      },
      link: function(scope, element, attrs) {
        scope.plugins = plugins;
        scope.state = state;
      },
      templateUrl: 'templates/arethusa.core/arethusa_tabs.html'
    };
  }
]);
