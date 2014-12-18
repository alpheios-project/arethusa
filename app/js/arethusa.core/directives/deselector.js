'use strict';
angular.module('arethusa.core').directive('deselector', [
  'state',
  'translator',
  function (state, translator) {
    return {
      restrict: 'AE',
      scope: {},
      link: function (scope, element, attrs) {
        element.bind('click', function (e) {
          state.deselectAll();
          scope.$apply();
        });

        var trsl, hint;

        scope.$on('keysAdded', function(_, keys) {
          var sel = keys.selections;
          if (sel) {
            hint = aU.formatKeyHint(sel.deselect);
            setTitle();
          }
        });

        translator('deselectAll', function(translation) {
          trsl = translation();
          setTitle();
        });

        function setTitle() {
          element.attr('title', trsl + ' ' + hint);
        }
      },
      template: '<i class="fi-unlock"/>'
    };
  }
]);
