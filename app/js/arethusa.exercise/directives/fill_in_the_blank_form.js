"use strict";

angular.module('arethusa.exercise').directive('fillInTheBlankForm', function() {
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {
    },
    templateUrl: 'templates/arethusa.exercise/fill_in_the_blank_form.html'
  };

});
