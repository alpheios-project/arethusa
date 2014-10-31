"use strict";

angular.module('arethusa.core').directive('helpPanelHeading', [
  function() {
    return {
      restrict: 'A',
      scope: {
        toggler: '@',
        heading: '@'
      },
      link: function(scope, element, attrs) {
        scope.toggle = function() {
          scope.$parent.toggle(scope.toggler);
        };
      },
      template: '\
        <p\
          class="text underline clickable"\
          translate="{{ heading }}"\
          ng-click="toggle()">\
        </p>\
      '
    };
  }
]);
