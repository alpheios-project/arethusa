'use strict';
angular.module('arethusa.core').directive('deselector', [
  'state',
  function (state) {
    return {
      restrict: 'AE',
      scope: {},
      link: function (scope, element, attrs) {
        element.bind('click', function (e) {
          state.deselectAll();
          scope.$apply();
        });
        var hint = arethusaUtil.formatKeyHint(state.activeKeys.deselect);
        scope.title = "Deselect all " + hint;
      },
      template: '<i title="{{ title }}" class="fi-unlock"/>'
    };
  }
]);
