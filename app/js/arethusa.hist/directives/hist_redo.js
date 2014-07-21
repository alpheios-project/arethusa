"use strict";

angular.module('arethusa.hist').directive('histRedo', [
  'history',
  function(history) {
    return {
      restrict: 'A',
      scope: {},
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

        element.bind('click', function() {
          scope.$apply(history.redo());
        });

        var hint = arethusaUtil.formatKeyHint(history.activeKeys.redo);
        element.attr('title', 'Redo ' + hint);
      },
      template: '<i class="fa fa-repeat"/>'
    };
  }
]);

