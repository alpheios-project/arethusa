"use strict";

angular.module('arethusa.oa').directive('oaCreator', [
  'oa',
  function(oa) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=oaCreator'
      },
      link: function(scope, element, attrs) {
        scope.target = oa.getTarget();

        scope.ontologies = oa.ontologies;

        scope.create = function() {
          oa.save(scope.target, scope.predicate, scope.body);
        };
      },
      templateUrl: 'templates/arethusa.oa/oa_creator.html'
    };
  }
]);
