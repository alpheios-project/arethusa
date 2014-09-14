"use strict";

angular.module('arethusa.tei').directive('lg', [
  function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.addClass('tei-lg');
      }
    };
  }
]);
