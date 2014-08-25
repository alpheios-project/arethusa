"use strict";

angular.module('arethusa.core').animation('.slider', [
  '$timeout',
  function($timeout) {
    return {
      enter: function(element, done) {
        var duration = 500;
        var h = element[0].clientHeight;
        var y = 0;
        var interval  = duration / 30;
        var increment = h / interval;

        function slideDown() {
          element.height(y + 'px');

          if (y < h) {
            $timeout(function() {
              y += increment;
              slideDown();
            }, interval);
          }
        }

        slideDown();
      },
      leave: function(element, done) {
        angular.element(element).slideUp(500, done);
      }
    };
  }
]);
