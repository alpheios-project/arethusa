"use strict";

angular.module('arethusa.core').animation('.slider', [
  '$timeout',
  function($timeout) {
    function enter(element, done) {
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
    }

    function leave(element, done) {
      angular.element(element).slideUp(500, done);
    }
    return {
      enter: enter,
      leave: leave,
      addClass: function(element, className, done) {
        if (className === 'ng-hide') leave(element, done);
      },
      removeClass: function(element, className, done) {
        if (className === 'ng-hide') enter(element, done);
      }
    };
  }
]);
