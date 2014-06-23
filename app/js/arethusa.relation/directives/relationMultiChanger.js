"use strict";

angular.module('arethusa.relation').directive('relationMultiChanger', [
  'relation',
  function(relation) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.isPossible = relation.multiChangePossible;
        scope.apply = relation.apply;
        scope.r = relation;
      },
      templateUrl: 'templates/arethusa.relation/relation_multi_changer.html'
    };
  }
]);
