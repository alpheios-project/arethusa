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
      change: '&'
    },
    link: function(scope, element, attrs) {
      scope.emptyLabel = "";
      scope.emptyObj = {};
      scope.$watch('current[property]', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          scope.change();
        }
      });
    },
    template: '\
      <ul>\
        <li ng-if="emptyVal"\
          nested-menu\
          property="property"\
          rel-obj="current"\
          ancestors="ancestors"\
          label="emptyLabel"\
          label-obj="emptyObj">\
        </li>\
        <li\
          ng-repeat="(label, labelObj) in all"\
          nested-menu\
          property="property"\
          rel-obj="current"\
          ancestors="ancestors"\
          label="label"\
          label-obj="labelObj">\
        </li>\
      </ul>\
    '
  };
});
