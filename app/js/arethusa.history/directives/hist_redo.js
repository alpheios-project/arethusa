"use strict";

angular.module('arethusa.history').directive('histRedo', [
  'history',
  'translator',
  function(history, translator) {
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

        var trsl, hint;

        scope.$on('keysAdded', function(_, keys) {
          var sel = keys.history;
          if (sel) {
            hint = aU.formatKeyHint(sel.redo);
            setTitle();
          }
        });

        translator('history.redo', function(translation) {
          trsl = translation;
          setTitle();
        });

        function setTitle() {
          element.attr('title', trsl + ' ' + hint);
        }
      },
      template: '<i class="fa fa-repeat"/>'
    };
  }
]);

