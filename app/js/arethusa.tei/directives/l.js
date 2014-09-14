"use strict";

angular.module('arethusa.tei').directive('l', [
  function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.addClass('tei-l');
      }
    };
  }
]);

