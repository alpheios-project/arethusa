"use strict";

angular.module('arethusa.core').directive('tokenWithId', function() {
  return {
    restrict: 'A',
    scope: {
      token: '=',
      tokenId: '='
    },
    link: function(scope, element, attrs) {
      scope.formatted = arethusaUtil.formatNumber(scope.tokenId, 0);
    },
    template: '<span>{{ token }} <sup class="note">{{ formatted }}</sup>'
  };

});
