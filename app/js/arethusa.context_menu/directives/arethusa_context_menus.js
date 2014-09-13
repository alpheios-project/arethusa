"use strict";

angular.module('arethusa.contextMenu').directive('arethusaContextMenus', [
  function() {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        plugins: '='
      },
      link: function(scope, element, attrs) {
        scope.fullId = function(token) {
          return token.sentenceId + token.id;
        };
      },
      template: '\
        <arethusa-context-menu\
          ng-repeat="(id, token) in tokens track by id"\
          plugins="plugins"\
          token-obj="token">\
        </arethusa-context-menu>\
      '
    };
  }
]);
