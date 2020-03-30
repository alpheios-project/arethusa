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
        var padding = element.css("padding-bottom").replace('px', '');
        var additionalBorder = attrs.fullHeight || 0;

        function resize(args) {
          var fullHeight = body.height();
          // if the body height comes up as 0 then we should just skip the resizing
          // because this is probably an error and the display will end up getting truncated
          // see issue #796
          if (fullHeight > 0) {
            element.height(fullHeight - margin - padding - additionalBorder);
          }
        }

        resize();
      }
    };
  }
]);
