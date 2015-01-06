"use strict";

angular.module('arethusa.core').directive('arethusaTool', [
  function() {
    return {
      restrict: 'A',
      scope: {
        tool: '=arethusaTool',
      },
      link: function(scope, element, attrs) {
        var tool = scope.tool;
        scope.uri = tool.uri;
      },
      templateUrl: 'templates/arethusa.core/arethusa_tool.html'
    };
  }
]);
