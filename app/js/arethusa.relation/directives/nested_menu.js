"use strict";

angular.module('arethusa.relation').directive('nestedMenu', [
  '$compile',
  function($compile) {
    return {
      restrict: 'A',
      scope: {
        relation: '=',
        values: '=',
        label: '='
      },
      link: function(scope, element, attrs) {
        var html = '<ul><li ng-repeat="(k, v) in values.nested" nested-menu relation="relation" label="k" values="v"></li></ul>';
        if (scope.values.nested) {
          element.append($compile(html)(scope));
        }
      },
      template: '{{ label }}'
    };
  }
]);
