"use strict";

angular.module('arethusa.core').directive('revealToggle', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      function el() {
        return angular.element(document.getElementById(attrs.revealToggle));
      }

      element.bind('click', function() {
        el().toggleClass('hide');
      });
    }
  };
});
