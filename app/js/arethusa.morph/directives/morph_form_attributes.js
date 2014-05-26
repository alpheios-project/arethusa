"use strict";

angular.module('arethusa.morph').directive('morphFormAttributes', function(morph, $document) {
  return {
    restrict: 'A',
    scope: {
      form: '=morphFormAttributes',
      tokenId: '='
    },
    link: function(scope, element, attrs) {
      scope.m = morph;
      scope.attrs = morph.sortAttributes(scope.form.attributes);
      scope.inv = scope.form.lexInv;
    },
    templateUrl: 'templates/arethusa.morph/morph_form_attributes.html'
  };
});
