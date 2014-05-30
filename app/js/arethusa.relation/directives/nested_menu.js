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
        label: '=',
        property: '=',
        ancestors: '='
      },
      link: function(scope, element, attrs) {
        var html = '\
          <ul\
            nested-menu-collection\
            current="relObj"\
            property="property"\
            ancestors="ancestors"\
            all="labelObj.nested">\
          </ul>\
        ';

        if (scope.labelObj.nested) {
          element.append($compile(html)(scope));
          element.addClass('nested');
        }

        scope.selectLabel = function() {
          scope.relObj[scope.property] = scope.label;
          relation.buildLabel(scope.relObj);
        };

        element.bind('click', function(event) {
          scope.$apply(function() {
            if (event.eventPhase === 2) { // at target, three would be bubbling!
              scope.selectLabel();
              if (scope.ancestors) {
                relation.resetAncestors(scope.relObj);
              }
            }
            if (scope.ancestors) {
              relation.addAncestor(scope.relObj, scope.label);
            }
          });
        });
      },
      template: '{{ label }}'
    };
  }
]);
