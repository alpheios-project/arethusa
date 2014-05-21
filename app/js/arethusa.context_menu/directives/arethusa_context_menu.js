"use strict";

angular.module('arethusa.contextMenu').directive('arethusaContextMenu', function() {
  return {
    restrict: 'AE',
    scope: {
      tokenId: '='
    },
    templateUrl: 'templates/arethusa.context_menu/arethusa_context_menu.html'
  };
});
