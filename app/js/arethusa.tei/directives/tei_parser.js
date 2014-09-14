"use strict";

angular.module('arethusa.tei').directive('teiParser', [
  'tei',
  '$compile',
  function(tei, $compile) {
    return {
      restrict: 'A',
      scope: {
        template: '=teiParser'
      },
      link: function(scope, element, attrs) {
        scope.$watch('template', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            element.empty();
            init();
          }
        });

        function init() {
          element.append($compile(scope.template)(scope));
        }
      }
    };
  }
]);
