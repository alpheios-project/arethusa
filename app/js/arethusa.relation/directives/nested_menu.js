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
          <ul\
            nested-menu-collection\
            current="relObj"\
            all="labelObj.nested">\
          </ul>\
        ';

        if (scope.labelObj.nested) {
          element.append($compile(html)(scope));
        }

        scope.selectLabel = function() {
          scope.relObj.prefix = scope.label;
          relation.buildLabel(scope.relObj);
        };

        element.bind('click', function(event) {
          scope.$apply(function() {
            if (event.eventPhase === 2) { // at target, three would be bubbling!
              scope.selectLabel();
              relation.resetAncestors(scope.relObj);
            }
            relation.addAncestor(scope.relObj, scope.label);
          });
        });
      },
      template: '{{ label }}'
    };
  }
]);
