"use strict";

angular.module('arethusa.core').directive('toBottom', [
  '$window',
  '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var canvas = angular.element(document.getElementById('canvas'));
        var win  = angular.element($window);
        win.on('resize', setHeight);
        scope.$on('stateLoaded', setHeight);

        function setHeight() {
          $timeout(function() {
            var offset = element.offset().top;
            var bottom = canvas.offset().top + canvas.height();
            element.height(bottom - offset);
            var svg = element.find('svg');
            if (svg[0]) {
              var elBottom = element[0].getBoundingClientRect().bottom;
              var svgTop = svg.offset().top;
              svg.height(elBottom - svgTop);
            }
          });
        }

        setHeight();
      }
    };
  }
]);
