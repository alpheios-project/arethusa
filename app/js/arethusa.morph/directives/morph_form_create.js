"use strict";

angular.module('arethusa.morph').directive('morphFormCreate', function() {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      scope.forms = scope.analysis.forms;
      scope.form = {
        postag: scope.plugin.emptyPostag(),
        attributes: {}
      };
      // watch changes to update the postag
      // save button to create the form formally
      // watch click events in upper scopes which
      // want to edit a form - replace the form in this scope
      // then and we're all good.
    },
    templateUrl: 'templates/morph_form_create.html'
  };
});
