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


        var trsl, hint;

        scope.$on('keysAdded', function(_, keys) {
          var sel = keys.saver;
          if (sel) {
            hint = aU.formatKeyHint(sel.save);
            setTitle();
          }
        });

        translator('save', function(translation) {
          trsl = translation();
          setTitle();
        });

        function setTitle() {
          element.attr('title', trsl + ' ' + hint);
        }
      },
      template: '<i class="fi-save"/>'
    };
  }
]);
