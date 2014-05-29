"use strict";

angular.module('arethusa.relation').directive('nestedMenuCollection', function() {
  return {
    restrict: 'A',
    replace: 'true',
    scope: {
      current: '=',
      all: '='
    },
    template: '\
      <ul>\
        <li\
          ng-repeat="(label, labelObj) in all"\
          nested-menu\
          rel-obj="current"\
          label="label"\
          label-obj="labelObj">\
        </li>\
      </ul>\
    '
  };
});
