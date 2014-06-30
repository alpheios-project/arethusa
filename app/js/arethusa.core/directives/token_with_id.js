'use strict';
angular.module('arethusa.core').directive('tokenWithId', [
  'idHandler',
  function (idHandler) {
    return {
      restrict: 'A',
      scope: {
        value: '=',
        tokenId: '='
      },
      link: function (scope, element, attrs) {
        scope.formatted = idHandler.formatId(scope.tokenId, '%w');
      },
      template: '<span>{{ value }} <sup class="note">{{ formatted }}</sup>'
    };
  }
]);

