"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenDefaultIp', [
  'artificialToken',
  function(artificialToken) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.aT = artificialToken;
      },
      templateUrl: 'templates/arethusa.artificial_token/artificial_token_default_ip.html'
    };
  }
]);
