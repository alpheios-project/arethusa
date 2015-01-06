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
      }
    };
  }
]);
