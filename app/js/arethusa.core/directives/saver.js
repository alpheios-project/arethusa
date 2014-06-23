"use strict";

angular.module('arethusa.core').directive('saver', [
  'saver',
  function(saver) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.saver = saver;

        element.bind('click', function() {
          scope.$apply(saver.save());
        });

        scope.$watch('saver.canSave', function(newVal, oldVal) {
          if (newVal) element.show(); else element.hide();
        });
      }
    };
  }
]);
