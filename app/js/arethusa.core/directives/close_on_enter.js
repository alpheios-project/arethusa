"use strict";

angular.module('arethusa.core').directive('closeOnEnter', [
  '$document',
  function($document) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function confirm(event) {
          if (event.keyCode === 13) scope.$close(true);
        }

        $document.on('keyup', confirm);
        scope.$on('$destroy', function() { $document.off('keyup', confirm); });
      },
    };
  }
]);
