"use strict";

angular.module('arethusa.sg').directive('sgAncestors', [
  'sg',
  function(sg) {
    return {
      restrict: 'A',
      scope: {
        sgAncestors: '='
      },
      templateUrl: './templates/arethusa.sg/ancestors.html'
    };
  }
]);
