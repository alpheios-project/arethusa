"use strict";

angular.module('arethusa.relation').directive('nestedMenuCollection', function() {
  return {
    restrict: 'A',
    replace: 'true',
    scope: {
      current: '=',
      all: '=',
      property: '=',
      ancestors: '=',
      emptyVal: '@',
      labelAs: "=",
      change: "&"
    },
    link: function(scope, element, attrs) {
      scope.emptyLabel = "";
      scope.emptyObj = {};
      scope.$watch('current[property]', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          scope.change({ obj: scope.current });
        }
      });

      scope.labelView = function(labelObj) {
        if (scope.labelAs) {
          return labelObj[scope.labelAs];
        } else {
          return labelObj.short;
        }
      };
    },
    template: '\
      <ul>\
        <li ng-if="emptyVal"\
          nested-menu\
          property="property"\
          rel-obj="current"\
          ancestors="ancestors"\
          change="change"\
          label="emptyLabel"\
          label-obj="emptyObj">\
        </li>\
        <li\
          ng-repeat="label in all | keys"\
          nested-menu\
          property="property"\
          rel-obj="current"\
          ancestors="ancestors"\
          label="labelView(all[label])"\
          label-as="labelAs"\
          label-obj="all[label]">\
        </li>\
      </ul>\
    '
  };
});
