"use strict";

angular.module('arethusa.core').directive('fullHeight', [
  '$window',
  function($window) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var win = angular.element($window);
        var body = angular.element(document.body);
        var border = angular.element(document.getElementById('panel-border')).height();
        var margin = element.css("margin-bottom").replace('px', '');

        function resize(args) {
          var fullHeight = body.height();
          element.height(fullHeight - border - margin);
        }
        win.bind('resize', function() {
          resize();
        });

        resize();
      }
    };
  }
]);
