'use strict';
angular.module('arethusa.core').directive('resizable', [
  '$window',
  '$document',
  function ($window, $document) {
    return {
      restrict: 'AEC',
      link: function (scope, element, attrs) {
        var maxSize = $window.innerWidth;
        var maxPos = maxSize - 400;
        var main = angular.element(document.getElementById('main-body'));
        element.on('mousedown', function (event) {
          event.preventDefault();
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });
        function mousemove(event) {
          var x = event.pageX;
          var el = element.parent();
          var leftPos = el.position().left;
          var border = leftPos + el.width();
          var diff = x - leftPos;
          var newSize = el.width() - diff;
          el.width(newSize);
          main.width(main.width() + diff);
        }
        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }
      }
    };
  }
]);