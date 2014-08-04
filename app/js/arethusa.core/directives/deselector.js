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

        var hint = arethusaUtil.formatKeyHint(state.activeKeys.deselect);
        translator('deselectAll', function(translation) {
          element.attr('title', translation + ' ' + hint);
        });
      },
      template: '<i class="fi-unlock"/>'
    };
  }
]);
