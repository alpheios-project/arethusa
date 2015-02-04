"use strict";

angular.module('arethusa.core').directive('navbarButtons', [
  'translator',
  function(translator) {
    return {
      restrict: 'A',
      replace: true,
      link: function(scope, element, attrs) {
        scope.$watch('windowWidth', function(newVal, oldVal) {
          var coll = newVal > 1150 ? '' : '_collapsed';
          scope.bTemplate = 'templates/arethusa.core/navbar_buttons' + coll + '.html';
        });

        translator('menu', function(trsl) {
          scope.menuTitle = trsl();
        });
      },
      template: '<ul class="has-form button-group right" ng-include="bTemplate"/>'
    };
  }
]);
