"use strict";

angular.module('arethusa.relation').directive('relationMultiChanger', [
  'relation',
  function(relation) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.isPossible = relation.multiChangePossible;
        scope.apply = relation.applyMultiChanger;
        scope.r = relation;

        scope.$watch('r.mode', function(newVal, oldVal) {
          if (relation.canEdit()) {
            element.show();
          } else {
            element.hide();
          }
        });
      },
      templateUrl: 'templates/arethusa.relation/relation_multi_changer.html'
    };
  }
]);
