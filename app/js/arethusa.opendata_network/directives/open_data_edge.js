"use strict";

angular.module('arethusa.opendataNetwork').directive('openDataEdge', [
  'state',
  'globalSettings',
  function (state, globalSettings) {
    return {
      restrict: 'AE',
      scope: {
        edge: '=',
        styles: '=',
        click: '@',
        hover: '@',
        highlight: '@'
      },
      link: function (scope, element, attrs) {
        scope.label = "+";
      },
      template : '\
        <span \
          menu-trigger="rightclick" \
          menu-position="bottom"  \
          menu-obj="edge" \
          title="{{ edge.type }}" \
          >{{ label }} \
        </span> \
      '
    };
  }
]);