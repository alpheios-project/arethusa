"use strict";

angular.module('arethusa.hist').directive('histUndo', [
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

        scope.$watch('history.canUndo', function(newVal, oldVal) {
          if (newVal !== oldVal) element.toggleClass('disabled');
        });

        element.bind('click', function() {
          scope.$apply(history.undo());
        });

        var hint = arethusaUtil.formatKeyHint(history.activeKeys.undo);
        element.attr('title', "Undo " + hint);
      },
      template: '<i class="fa fa-undo"/>'
    };
  }
]);
