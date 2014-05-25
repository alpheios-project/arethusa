"use strict";

angular.module('arethusa.core').directive('tokenWithId', function() {
  return {
    restrict: 'A',
    scope: {
      value: '=',
      tokenId: '='
    },
    link: function(scope, element, attrs) {
      scope.formatted = arethusaUtil.formatNumber(scope.tokenId, 0);
    },
    template: '<span>{{ value }} <sup class="note">{{ formatted }}</sup>'
  };

});
