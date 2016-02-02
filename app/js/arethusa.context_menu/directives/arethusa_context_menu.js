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
      templateUrl: 'js/arethusa.context_menu/templates/arethusa_context_menu.html'
    };
  }
]);
