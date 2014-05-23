"use strict";

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

      var schema = scope.plugin.postagSchema;

      scope.forms = scope.analysis.forms;
      scope.form = {
        postag: scope.plugin.emptyPostag(),
        attributes: a
      };

      function inArray(arr, val) {
        return arr.indexOf(val) !== -1;
      }

      function dependencyMet(dependencies) {
        if (! dependencies) {
          return true;
        }

        var ok = true;
        for (var k in dependencies) {
          var depArray = dependencies[k];
          if (! inArray(depArray, scope.form.attributes[k])) {
            ok = false;
            break;
          }
        }
        return ok;
      }

      function getVisibleAttributes() {
        return arethusaUtil.inject([], schema, function(memo, attr) {
          var ifDependencies = (scope.plugin.dependenciesOf(attr) || {}).if;
          if (dependencyMet(ifDependencies)) {
            memo.push(attr);
          }
        });
      }

      function setVisibleAttributes() {
        scope.visibleAttributes = getVisibleAttributes();
      }

      scope.$watch('form.attributes', function(newVal, oldVal) {
        setVisibleAttributes();
      }, true);

      // save button to create the form formally
      // watch click events in upper scopes which
      // want to edit a form - replace the form in this scope
      // then and we're all good.
    },
    templateUrl: 'templates/morph_form_create.html'
  };
});
