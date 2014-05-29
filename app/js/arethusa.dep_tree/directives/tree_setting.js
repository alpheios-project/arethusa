"use strict";

angular.module('arethusa.depTree').directive('treeSetting', function() {
  return {
    restrict: 'A',
    scope: {
      title: '@',
      val: '=treeSetting'
    },
    link: function(scope, element, attrs) {
      scope.increment = function() {
        scope.val++;
      };
      scope.decrement = function() {
        scope.val--;
      };
    },
    templateUrl: 'templates/arethusa.dep_tree/tree_setting.html'
  };

});
