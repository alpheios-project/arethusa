"use strict";

angular.module('arethusa.morph').directive('morphForm', [
  'morph',
  function(morph) {
    return {
      restrict: 'A',
      scope: {
        form: "=morphForm"
      },
      link: function(scope, element, attrs) {
        scope.plugin = morph;
      },
      templateUrl: 'templates/arethusa.morph/morph_form.html'
    };
  }
]);
