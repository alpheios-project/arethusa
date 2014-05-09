"use strict";

/* global arethusaUtil */
angular.module('arethusa.morph').directive('morphFormCreate', function() {
  return {
    restrict: 'E',
    scope: true,
    link: function(scope, element, attrs) {
      // need to prefill the attributes, so that we can set watches on all
      // attribute changes - we need it to update the postag in synchronizePostag
      var a = arethusaUtil.inject({}, scope.plugin.postagSchema, function(memo, el) {
        memo[el] = undefined;
      });
      scope.forms = scope.analysis.forms;
      scope.form = {
        postag: scope.plugin.emptyPostag(),
        attributes: a
      };
      // save button to create the form formally
      // watch click events in upper scopes which
      // want to edit a form - replace the form in this scope
      // then and we're all good.
    },
    templateUrl: 'templates/morph_form_create.html'
  };
});
