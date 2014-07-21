"use strict";

angular.module('arethusa.core').directive('helpTrigger', [
  'help',
  function(help) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function toggle() {
          scope.$apply(help.toggle());
        }

        element.bind('click', toggle);
      }
    };
  }
]);
