"use strict";

angular.module('arethusa.morph').directive('morphFormAttributes', [
  'morph',
  'notifier',
  'state',
  function(morph, notifier, state) {
    return {
      restrict: 'A',
      scope: {
        form: '=morphFormAttributes',
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var id = scope.tokenId;

        scope.m = morph;
        scope.attrs = morph.sortAttributes(scope.form.attributes);
        scope.inv = scope.form.lexInv;

        scope.askForRemoval = function() {
          scope.confirmationRequested = true;
        };

        scope.skipRemoval = function() {
          scope.confirmationRequested = false;
        };

        scope.removeForm = function() {
          if (scope.form.selected) {
            morph.unsetState(id);
          }
          morph.removeForm(id, scope.form);
          notifier.success('Removed form of ' + state.asString(id));
        };
      },
      templateUrl: 'templates/arethusa.morph/morph_form_attributes.html'
    };
  }
]);
