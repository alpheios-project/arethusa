'use strict';

angular.module('arethusa.morph').directive('morphFormCreate', [
  'morph',
  '$timeout',
  function(morph, $timeout) {
    return {
      restrict: 'E',
      scope: {
        token: '=morphToken',
        id: '=morphId'
      },
      link: function (scope, element, attrs) {
        var inArray = arethusaUtil.isIncluded;

        scope.m = morph;
        scope.form = scope.token.customForm;
        scope.forms = scope.token.forms;

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

        scope.reset = function() {
          scope.resetAlert();
          morph.resetCustomForm(scope.token);
        };

        scope.resetAlert = function() {
          scope.alert = false;
        };

        scope.formError = {
          msg: 'Cannot save an incomplete form',
          type: 'error'
        };

        scope.save = function(valid) {
          if (valid) {
            cleanUpAttributes();
            addOrigin();
            addForm();
            scope.reset();
          } else {
            scope.alert = true;
          }
        };

        // At the point of saving we have undefined values around in the
        // forms attributes - we clean them up as to not distort our output
        function cleanUpAttributes() {
          var cleanAttrs = arethusaUtil.inject({}, scope.visibleAttributes, function(memo, attr) {
            memo[attr] = scope.form.attributes[attr];
          });
          scope.form.attributes = cleanAttrs;
        }

        function addOrigin() {
          scope.form.origin = 'you';
        }

        function addForm() {
          var newForm = angular.copy(scope.form);
          scope.forms.push(newForm);
          morph.setState(scope.id, newForm);
        }

        scope.$watch('form.attributes', function (newVal, oldVal) {
          setVisibleAttributes();
        }, true);

        scope.$watch('token.customForm', function(newVal, oldVal) {
          scope.form = newVal;
        });
      },
      templateUrl: 'templates/morph_form_create.html'
    };
  }
]);
