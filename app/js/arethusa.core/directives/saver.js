"use strict";

angular.module('arethusa.core').directive('saver', [
  'saver',
  function(saver) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.saver = saver;
        var saveWatch;

        element.bind('click', function() {
          scope.$apply(saver.save());
        });

        scope.$watch('saver.canSave', function(newVal, oldVal) {
          if (newVal) {
            element.show();
            addSaveWatch();
          } else {
            element.hide();
            removeSaveWatch();
          }
        });

        function addSaveWatch() {
          // Safety measure, so that we never register the watch twice, which
          // might never happen anyway, but who knows.
          removeSaveWatch();

          saveWatch = scope.$watch('saver.needsSave', function(newVal, oldVal) {
            if (newVal) {
              element.addClass('alert');
              element.removeClass('disabled');
            } else {
              element.addClass('disabled');
              element.removeClass('alert');
            }
          });
        }

        function removeSaveWatch() {
          if (saveWatch) saveWatch();
        }

        var hint = arethusaUtil.formatKeyHint(saver.activeKeys.save);
        element.attr('title', "Save " + hint);
      },
      template: '<i class="fi-save"/>'
    };
  }
]);
