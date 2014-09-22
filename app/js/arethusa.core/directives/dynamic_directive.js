"use strict";

angular.module('arethusa.core').directive('dynamicDirective', [
  '$compile',
  function($compile) {
    return {
      restrict: 'A',
      scope: {
        directive: '@dynamicDirective'
      },
      link: function(scope, element, attrs) {
        var tag = element[0].tagName.toLowerCase();
        var tmpl = '<' + tag + ' ' + scope.directive + '></' + tag + '>';
        element.append($compile(tmpl)(scope.$parent));
      }
    };
  }
]);
