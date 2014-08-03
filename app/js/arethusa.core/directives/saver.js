"use strict";

angular.module('arethusa.core').directive('saver', [
  'saver',
  'translator',
  function(saver, translator) {
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

        var parent = element.parent();
        var hint = arethusaUtil.formatKeyHint(saver.activeKeys.save);
        translator('saver.save', function(translation) {
          parent.attr('title', translation + " " + hint);
        });
      },
      template: '<i class="fi-save"/>'
    };
  }
]);
