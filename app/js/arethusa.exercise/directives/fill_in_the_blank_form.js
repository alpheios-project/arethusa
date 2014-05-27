'use strict';
angular.module('arethusa.exercise').directive('fillInTheBlankForm', function () {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, element, attrs) {
      scope.validatedClass = function () {
        var rep = scope.plugin.report;
        if (rep) {
          if (rep.tokens[scope.id].correct) {
            return 'right-answer';
          } else {
            return 'wrong-answer';
          }
        }
      };
    },
    templateUrl: 'templates/arethusa.exercise/fill_in_the_blank_form.html'
  };
});