"use strict";

angular.module('arethusa.sg').directive('sgAncestors', [
  'sg',
  function(sg) {
    return {
      restrict: 'A',
      scope: {
        sgAncestors: '='
      },
      template: '<div ng-repeat="o in sgAncestors">{{ o.long }}</div>'
    };
  }
]);
