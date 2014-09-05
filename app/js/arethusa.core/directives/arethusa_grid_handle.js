"use strict";

angular.module('arethusa.core').directive('arethusaGridHandle', [
  function() {
    return {
      restrict: 'E',
      scope: true,
      link: function(scope, element, attrs, ctrl, transclude) {

      },
      templateUrl: 'templates/arethusa.core/arethusa_grid_handle.html'
    };
  }
]);
