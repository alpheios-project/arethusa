'use strict';

angular.module('arethusa.morph').directive('morphFormCreate', [
  'morph',
    function(morph) {
    return {
      restrict: 'E',
      scope: {
        forms: '='
      },
      link: function (scope, element, attrs) {
        var inArray = arethusaUtil.isIncluded;

        scope.form = morph.emptyForm();
        scope.m = morph;

        function dependencyMet(dependencies) {
          if (!dependencies) {
            return true;
          }
          var ok = true;
          for (var k in dependencies) {
            var depArray = dependencies[k];
            if (!inArray(depArray, scope.form.attributes[k])) {
              ok = false;
              break;
            }
          }
          return ok;
        }

        function getVisibleAttributes() {
          return arethusaUtil.inject([], morph.postagSchema, function (memo, attr) {
            var ifDependencies = (morph.dependenciesOf(attr) || {}).if;
            if (dependencyMet(ifDependencies)) {
              memo.push(attr);
            }
          });
        }

        function setVisibleAttributes() {
          scope.visibleAttributes = getVisibleAttributes();
        }

        scope.$watch('form.attributes', function (newVal, oldVal) {
          setVisibleAttributes();
        }, true);

        // TBD
        //
        // save button to create the form formally
        // watch click events in upper scopes which
        // want to edit a form - replace the form in this scope
        // then and we're all good.
      },
      templateUrl: 'templates/morph_form_create.html'
    };
  }
]);
