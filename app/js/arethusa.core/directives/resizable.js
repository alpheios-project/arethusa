'use strict';
angular.module('arethusa.core').directive('resizable', [
  '$window',
  '$document',
  function ($window, $document) {
    return {
      restrict: 'AEC',
      link: function (scope, element, attrs) {
        var main = angular.element(document.getElementById('main-body'));
        var win = angular.element($window);
        var panel = element.parent();

        var panelMin = 260;
        var mainMin  = 260;

        element.on('mousedown', function (event) {
          event.preventDefault();
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        // This is very unstable and chaotic.
        // We substract 0.5 in the last step to deal with a viewport with
        // a width that is not a round number.
        // There is a possibility that the divs that are resized shrinked by
        // this though.
        //
        // A better solution might be to really recompute the size of
        // the resized diffs - right now we are moving them around step
        // by step.
        function mousemove(event) {
          var x = Math.floor(event.pageX);
          var leftPos = Math.round(panel.position().left);
          var width = Math.round(panel.width());
          var border = leftPos + width;
          var diff = x - leftPos;
          var panelSize = width - diff;
          var mainSize  = main.width() + diff;

          if (withinBoundaries(panelSize, mainSize)) {
            panel.width(panelSize);
            main.width(mainSize);
          }
        }

        function withinBoundaries(panel, main) {
          return panel > panelMin && main > mainMin;
        }

        function mouseup() {
          win.trigger('resize');
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }
      }
    };
  }
]);
