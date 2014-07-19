"use strict";

angular.module('arethusa.hist').directive('histRedo', [
  'history',
  function(history) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.history = history;

        scope.$watch('history.mode', function(newVal, oldVal) {
          if (newVal === 'editor') {
            element.show();
          } else {
            element.hide();
          }
        });
      },
      template: '<i title="Redo" class="fa fa-repeat"/>'
    };
  }
]);

