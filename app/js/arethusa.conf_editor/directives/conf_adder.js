'use strict';
angular.module('arethusa.confEditor').directive('confAdder', function () {
  return {
    restrict: 'AE',
    scope: {
      text: '@',
      submitter: '&'
    },
    link: function (scope, element, attrs) {
      scope.submitInput = function () {
        // Quite interesting how we need to pass the argument as
        // an object here... Can't really explain why atm.
        scope.submitter({ input: scope.input });
        scope.input = '';
      };
    },
    templateUrl: 'templates/conf_editor/conf_adder.html'
  };
});