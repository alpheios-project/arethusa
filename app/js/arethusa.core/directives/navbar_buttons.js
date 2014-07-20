"use strict";

angular.module('arethusa.core').directive('navbarButtons', function() {
  return {
    restrict: 'A',
    replace: true,
    link: function(scope, element, attrs) {
      scope.$watch('windowWidth', function(newVal, oldVal) {
        var coll = newVal > 890 ? '' : '_collapsed';
        scope.bTemplate = 'templates/arethusa.core/navbar_buttons' + coll + '.html';
      });
    },
    template: '<ul class="has-form button-group right" ng-include="bTemplate"/>'
  };
});
