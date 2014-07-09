"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenList', [
  'artificialToken',
  function(artificialToken) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        scope.aT = artificialToken;
      },
      templateUrl: 'templates/arethusa.artificial_token/artificial_token_list.html'
    };
  }
]);
