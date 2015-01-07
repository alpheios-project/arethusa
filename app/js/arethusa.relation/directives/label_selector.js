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
          if (attrs.change && angular.isFunction(scope.change)) {
            scope.change();
          } else {
            var oldAncestors = angular.copy(obj.ancestors);
            $timeout(function() {
              relation.changeState(obj, oldAncestors);
            });
          }
        });
      },
      templateUrl: 'templates/arethusa.relation/label_selector.html'
    };
  }
]);
