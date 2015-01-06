"use strict";

angular.module('arethusa.core').directive('provTools', [
  'provTools',
  function(provTools) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.provTools = provTools;
      },
      templateUrl: 'templates/arethusa.core/prov_tools.html'
    };
  }
]);
