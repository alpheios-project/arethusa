'use strict';

/* global prettyPrint */

angular.module('fileBrowserApp').directive('prettyPrint', [
  '$timeout',
  '$compile',
  function($timeout, $compile) {
    return {
      restrict: 'A',
      scope: {
        on: '=prettyPrint',
        content: '='
      },
      link: function(scope, element, attrs) {
        var template = '<code ng-class="{ prettyprint: on }">{{ content }}</code>';

        function update(newVal, oldVal) {
          if (newVal !== oldVal) {
            element.empty();
            element.append($compile(template)(scope));
            if (scope.on) $timeout(prettyPrint);
          }
        }

        scope.$watch('content', update);
        scope.$watch('on', update);

        update(true, false); // run once on init
      }
    };
  }
]);
