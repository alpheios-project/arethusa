"use strict";

angular.module('arethusa.relation').directive('labelSelector', [
  'relation',
  function(relation) {
    return {
      restrict: 'A',
      scope: {
        obj: '=',
        change: '&'
      },
      link: function(scope, element, attrs) {
        scope.plugin = relation;
      },
      templateUrl: 'templates/arethusa.relation/label_selector.html'
    };
  }
]);
