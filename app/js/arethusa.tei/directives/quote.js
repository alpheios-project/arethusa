"use strict";

angular.module('arethusa.tei').directive('quote', [
  function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.addClass('tei-quote');
      }
    };
  }
]);
