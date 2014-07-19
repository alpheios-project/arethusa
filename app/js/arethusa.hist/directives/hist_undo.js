"use strict";

angular.module('arethusa.hist').directive('histUndo', [
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

        scope.$watch('history.canUndo', function(newVal, oldVal) {
          if (newVal !== oldVal) element.toggleClass('disabled');
        });

        element.bind('click', function() {
          scope.$apply(history.undo());
        });
      },
      template: '<i title="Undo" ng-click="history.undo()" class="fa fa-undo"/>'
    };
  }
]);
