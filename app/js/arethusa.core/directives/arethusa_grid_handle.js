"use strict";

angular.module('arethusa.core').directive('arethusaGridHandle', [
  function() {
    return {
      restrict: 'E',
      scope: true,
      link: function(scope, element, attrs, ctrl, transclude) {
        function mouseEnter() {
          scope.$apply(function() { scope.visible = true; });
        }

        function mouseLeave(event) {
          scope.$apply(function() { scope.visible = false; });
        }

        var trigger = element.find('.drag-handle-trigger');
        var handle  = element.find('.drag-handle');

        trigger.bind('mouseenter', mouseEnter);
        handle.bind('mouseleave', mouseLeave);
      },
      templateUrl: 'templates/arethusa.core/arethusa_grid_handle.html'
    };
  }
]);
