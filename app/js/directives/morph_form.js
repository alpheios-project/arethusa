"use strict";

angular.module('arethusa').directive('morphForm', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'templates/morph_form.html'
  };
});
