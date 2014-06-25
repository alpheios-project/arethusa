"use strict";

angular.module('arethusa.core').directive('fullHeight', [
  '$window',
  function($window) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var win = angular.element($window);
        var body = angular.element(document.body);
        var border = angular.element(document.getElementById('canvas-border')).height();
        var margin = element.css("margin-bottom").replace('px', '');
        var additionalBorder = attrs.fullHeight || 0;

        function resize(args) {
          var fullHeight = body.height();
          element.height(fullHeight - margin - additionalBorder);
        }
        win.bind('resize', function() {
          resize();
        });

        resize();
      }
    };
  }
]);
