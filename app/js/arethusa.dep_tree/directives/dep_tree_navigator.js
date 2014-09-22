"use strict";

angular.module('arethusa.depTree').directive('depTreeNavigator', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$watch('groupSize', function(newVal, oldVal) {
          launch();
        });

        function launch() {
          var triggers = [];
          if (scope.groupSize > 1) {
            for (var i = 0; i  < scope.groupSize; i ++) {
              triggers.push(i);
            }
          }
          scope.focusTriggers = triggers;
        }

        scope.setCurrentFocus = function(focus) {
          scope.currentFocus = focus;
        };
      },
      templateUrl: 'templates/arethusa.dep_tree/dep_tree_navigator.html'
    };
  }
]);
