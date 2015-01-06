"use strict";

angular.module('arethusa.tei').directive('teiParser', [
  'tei',
  '$compile',
  function(tei, $compile) {
    return {
      restrict: 'A',
      scope: {
        template: '=teiParser'
      },
      link: function(scope, element, attrs) {
        scope.$watch('template', function(newVal, oldVal) {
          // @balmas TODO - need to confirm when we should expect
          // newVal to equal oldVal and when not
          // as currently coded anyway the watch seems only to 
          // execute when both are equal -- this came up when
          // coding the text_context directive as well
          if (newVal) {
            element.empty();
            init();
          }
        });

        function init() {
          element.append($compile(scope.template)(scope));
        }
      }
    };
  }
]);
