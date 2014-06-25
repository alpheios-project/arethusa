'use strict';
angular.module('arethusa.core').directive('resizable', [
  '$window',
  '$document',
  '$timeout',
  function ($window, $document, $timeout) {
    return {
      restrict: 'AEC',
      link: function (scope, element, attrs) {
        var maxSize = $window.innerWidth;
        var maxPos = maxSize - 400;
        var main = angular.element(document.getElementById('main-body'));
        var win  = angular.element($window);
        var canvas = angular.element(document.getElementById('canvas'));

        win.on('resize', function() {
          setHeight();
        });

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
          var el = element.parent();
          var leftPos = Math.round(el.position().left);
          var width = Math.round(el.width());
          var border = leftPos + width;
          var diff = x - leftPos;
          var newSize = width - diff;
          el.width(newSize);
          main.width(main.width() + diff - 0.5);
        }

        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }

        function setHeight() {
          $timeout(function() {
            element.height(canvas.height());
          });
        }

        setHeight();
      }
    };
  }
]);
