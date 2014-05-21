"use strict";

angular.module('arethusa.contextMenu').directive('arethusaContextMenu', function(state) {
  return {
    restrict: 'AE',
    scope: {
      tokenId: '=',
      plugins: "="
    },
    link: function(scope, element, attrs) {
      scope.state = state;
      scope.token = state.getToken(scope.tokenId);
    },
    templateUrl: 'templates/arethusa.context_menu/arethusa_context_menu.html'
  };
});
