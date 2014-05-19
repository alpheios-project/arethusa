"use strict";

angular.module('arethusa.confEditor').directive('confAdder', function() {
  return {
    restrict: 'AE',
    scope: {
      text: '@',
      submitter: '&'
    },
    link: function(scope, element, attrs) {
      scope.submitInput = function() {
        scope.submitter({ input: scope.input });
        scope.input = '';
      };
    },
    templateUrl: 'templates/conf_editor/conf_adder.html'
  };
});
