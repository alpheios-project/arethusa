"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenList', [
  'artificialToken',
  'idHandler',
  function(artificialToken, idHandler) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope.aT = artificialToken;
        scope.formatId = function(id) {
          return idHandler.formatId(id, '%s-%w');
        };
      },
      templateUrl: 'templates/arethusa.artificial_token/artificial_token_list.html'
    };
  }
]);
