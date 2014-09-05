"use strict";

angular.module('arethusa.core').directive('arethusaGridHandle', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'E',
      scope: true,
      link: function(scope, element, attrs, ctrl, transclude) {
        var enter;
        function mouseEnter() {
          enter = $timeout(function() { scope.visible = true; }, 100);
        }

        function mouseLeave() {
          $timeout.cancel(enter);
        }

        function dragLeave() {
          scope.$apply(function() { scope.visible = false; });
        }

        var trigger = element.find('.drag-handle-trigger');
        var handle  = element.find('.drag-handle');

        trigger.bind('mouseenter', mouseEnter);
        trigger.bind('mouseleave', mouseLeave);
        handle.bind('mouseleave', dragLeave);
      },
      templateUrl: 'templates/arethusa.core/arethusa_grid_handle.html'
    };
  }
]);
