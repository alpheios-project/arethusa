"use strict";

angular.module('arethusa.relation').directive('labelViewer', [
  'relation',
  '$timeout',
  function(state, relation, $timeout) {
    return {
      restrict: 'A',
      scope: {
        obj: '='
      },
      link: function(scope, element, attrs) {
        scope.plugin = relation;
      },
      templateUrl: 'templates/arethusa.relation/label_viewer.html'
    };
  }
]);
