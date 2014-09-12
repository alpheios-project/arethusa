"use strict";

angular.module('arethusa.core').directive('arethusaGridHandle', [
  '$timeout',
  'plugins',
  function($timeout, plugins) {
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

        scope.$on('pluginsLoaded', function() {
          scope.plugin = plugins.get(scope.item.plugin);
        });

        scope.$watch('visible', function(newVal, oldVal) {
          if (!newVal) scope.settingsOn = false;
        });
      },
      templateUrl: 'templates/arethusa.core/arethusa_grid_handle.html'
    };
  }
]);
