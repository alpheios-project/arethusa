"use strict";

angular.module('arethusa.core').directive('resizable', function($window, $document) {
  return {
    restrict: 'AEC',
    link: function(scope, element, attrs) {
      var maxPos = $window.innerWidth - 300;

      element.on('mousedown', function(event) {
        event.preventDefault();
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      var mousemove = function(event) {
        var leftPos = element.position().left;
        var diff = event.pageX - leftPos;
        var newSize = element.width() - diff;
        element.width(newSize);
      };

      var mouseup = function() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      };
    }
  };

});
