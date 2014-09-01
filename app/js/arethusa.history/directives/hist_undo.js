"use strict";

angular.module('arethusa.history').directive('histUndo', [
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

        scope.$watch('history.canUndo', function(newVal, oldVal) {
          if (newVal) {
            element.addClass('disabled');
          } else {
            element.removeClass('disabled');
          }
        });

        element.bind('click', function() {
          scope.$apply(history.undo());
        });


        var trsl, hint;

        scope.$on('keysAdded', function(_, keys) {
          var sel = keys.history;
          if (sel) {
            hint = aU.formatKeyHint(sel.undo);
            setTitle();
          }
        });

        translator('history.undo', function(translation) {
          trsl = translation;
          setTitle();
        });

        function setTitle() {
          element.attr('title', trsl + ' ' + hint);
        }
      },
      template: '<i class="fa fa-undo"/>'
    };
  }
]);
