"use strict";

angular.module('arethusa.core').directive('spinner', [
  'spinner',
  function(spinner) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.spinner = spinner;

        scope.$watch('spinner.spinning', function(newVal, oldVal) {
          scope.visible = newVal;
        });
      },
      template: '<i ng-show="visible" class="fa fa-spinner fa-spin info-message"></i>'
    };
  }
]);
