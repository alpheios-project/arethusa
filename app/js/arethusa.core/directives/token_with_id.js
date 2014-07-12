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
        function formatId(newId) {
          scope.formatted = idHandler.formatId(newId, '%s-%w');
        }

        scope.$watch('tokenId', formatId);

      },
      template: '<span>{{ value }} <sup class="note">{{ formatted }}</sup>'
    };
  }
]);

