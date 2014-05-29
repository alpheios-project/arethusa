"use strict";

angular.module('arethusa.relation').directive('nestedMenuCollection', function() {
  return {
    restrict: 'A',
    replace: 'true',
    scope: {
      current: '=',
      all: '=',
      property: '=',
      ancestors: '='
    },
    template: '\
      <ul>\
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
