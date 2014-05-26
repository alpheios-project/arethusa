"use strict";

angular.module('arethusa.morph').directive('morphFormAttributes', function(morph) {
  return {
    restrict: 'A',
    scope: {
      form: '=morphFormAttributes'
    },
    link: function(scope, element, attrs) {
      scope.m = morph;
      scope.attrs = morph.sortAttributes(scope.form.attributes);
      scope.inventoryAvailable = scope.form.lexInvUri;

      if (scope.inventoryAvailable) {
        scope.urn = formattedUrn(scope.form.lexInvUri);
      }

      function formattedUrn(uri) {
        return uri.slice(uri.indexOf('urn:'));
      }
    },
    templateUrl: 'templates/arethusa.morph/morph_form_attributes.html'
  };
});
