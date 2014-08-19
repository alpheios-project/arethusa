'use strict';
angular.module('arethusa.contextMenu').directive('arethusaContextMenu', [
  function () {
    return {
      restrict: 'AE',
      scope: {
        token: '=tokenObj',
        plugins: '='
      },
      link: function (scope, element, attrs) {
      },
      templateUrl: 'templates/arethusa.context_menu/arethusa_context_menu.html'
    };
  }
]);
