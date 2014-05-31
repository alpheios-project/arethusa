"use strict";

angular.module('arethusa.contextMenu').directive('arethusaContextMenus', [
  function() {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        plugins: '='
      },
      template: '\
        <arethusa-context-menu\
          ng-repeat="token in tokens"\
          plugins="plugins"\
          token-id="token.id">\
        </arethusa-context-menu>\
      '
    };
  }
]);
