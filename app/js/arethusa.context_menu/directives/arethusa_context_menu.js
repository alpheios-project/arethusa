'use strict';
angular.module('arethusa.contextMenu').directive('arethusaContextMenu', [
  'state',
  function (state) {
    return {
      restrict: 'AE',
      scope: {
        tokenId: '=',
        plugins: '='
      },
      link: function (scope, element, attrs) {
        scope.state = state;
        scope.token = state.getToken(scope.tokenId);
        scope.active = function () {
          return scope.token.status.contextMenuOpen;
        };
      },
      templateUrl: 'templates/arethusa.context_menu/arethusa_context_menu.html'
    };
  }
]);