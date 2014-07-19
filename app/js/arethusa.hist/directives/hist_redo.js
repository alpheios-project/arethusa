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

        scope.$watch('history.canRedo', function(newVal, oldVal) {
          if (newVal !== oldVal) element.toggleClass('disabled');
        });
      },
      template: '<i title="Redo" ng-click="history.redo" class="fa fa-repeat"/>'
    };
  }
]);

