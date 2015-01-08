"use strict";

angular.module('arethusa.tei').directive('met', [
  function() {
    return {
      restrict: 'A',
      scope: {
        met: '@'
      },
      link: function(scope, element, attrs) {
        element.addClass('meter-'+scope.met);
        element.attr('title',scope.met);
        angular.forEach(element.children(), function(elem,i) {
          if (i == 0 && scope.met) {
            angular.element(elem).attr('meter',scope.met);
          }
        })
      }
    };
  }
]);
