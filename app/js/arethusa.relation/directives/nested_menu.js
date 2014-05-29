"use strict";

angular.module('arethusa.relation').directive('nestedMenu', [
  '$compile',
  'relation',
  function($compile, relation) {
    return {
      restrict: 'A',
      scope: {
        relObj: '=',
        labelObj: '=',
        label: '='
      },
      link: function(scope, element, attrs) {
        var html = '\
        <ul>\
          <li\
            ng-repeat="(k, v) in labelObj.nested"\
            nested-menu\
            ng-class="{hover: k === relObj.label}"\
            rel-obj="relObj"\
            label="k" label-obj="v">\
          </li>\
        </ul>';

        if (scope.labelObj.nested) {
          console.log('lig');
          element.append($compile(html)(scope));
        }

        scope.selectLabel = function() {
          scope.relObj.prefix = scope.label;
          relation.buildLabel(scope.relObj);
        };

        element.bind('click', function(event) {
          event.stopPropagation();
          scope.$apply(scope.selectLabel());
        });
      },
      template: '{{ label }}'
    };
  }
]);
