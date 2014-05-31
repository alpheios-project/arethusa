'use strict';
angular.module('arethusa.contextMenu').directive('arethusaContextMenu', [
  function () {
    return {
      restrict: 'AE',
      scope: {
        tokenObj: '=',
        plugins: '='
      },
      link: function (scope, element, attrs) {
        scope.idKey = 'tcm';

        scope.token   = scope.tokenObj;

        scope.active = function () {
          return scope.token.status.contextMenuOpen;
        };
      },
      templateUrl: 'templates/arethusa.context_menu/arethusa_context_menu.html'
    };
  }
]);
