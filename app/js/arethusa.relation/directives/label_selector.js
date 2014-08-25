"use strict";

angular.module('arethusa.relation').directive('labelSelector', [
  'relation',
  '$timeout',
  function(relation, $timeout) {
    return {
      restrict: 'A',
      scope: {
        obj: '=',
        change: '&'
      },
      link: function(scope, element, attrs) {
        scope.plugin = relation;
        scope.showMenu = true;

        scope.$watch('plugin.mode', function(newVal, oldVal) {
          scope.showMenu = relation.canEdit();
        });

        scope.$on('nestedMenuSelection', function(event, obj) {
          $timeout(function() {
            relation.changeState(obj);
          });
        });
      },
      templateUrl: 'templates/arethusa.relation/label_selector.html'
    };
  }
]);
