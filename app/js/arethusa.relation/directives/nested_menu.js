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
        labelAs: '=',
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
            label-as="labelAs"\
            all="labelObj.nested">\
          </ul>\
        ';

        scope.labelRepresentation = scope.label ? scope.label : '---';

        if (scope.labelObj.nested) {
          element.append($compile(html)(scope));
          element.addClass('nested');
        }

        scope.selectLabel = function() {
          scope.relObj[scope.property] = scope.label;
          relation.buildLabel(scope.relObj);
        };

        scope.addAncestor = function(obj, ancestor) {
          obj.ancestors.unshift(ancestor);
        };

        scope.resetAncestors = function(obj) {
          var ancestors = obj.ancestors;
          while (ancestors.length > 0) {
            ancestors.pop();
          }
        };

        element.bind('click', function(event) {
          scope.$apply(function() {
            if (event.eventPhase === 2) { // at target, three would be bubbling!
              scope.selectLabel();
              if (scope.ancestors) {
                scope.resetAncestors(scope.relObj);
              }
            }
            if (scope.ancestors) {
              scope.addAncestor(scope.relObj, scope.labelObj);
            }
          });
        });
      },
      template: '{{ labelRepresentation }}'
    };
  }
]);
