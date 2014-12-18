'use strict';

angular.module('arethusa.morph').directive('morphFormCreate', [
  'morph',
  'state',
  'notifier',
  'translator',
  'morphLocalStorage',
  function(morph, state, notifier, translator, morphLocalStorage) {
    return {
      restrict: 'E',
      scope: {
        token: '=morphToken',
        id: '=morphId'
      },
      link: function (scope, element, attrs, form) {
        var inArray = arethusaUtil.isIncluded;
        var lemmaForm = element.find('#lemma-form');

        scope.translations = translator({
          'morph.createSuccess': 'createSuccess',
          'morph.createError': 'createError'
        });


        scope.m = morph;
        scope.form = scope.token.customForm;
        scope.forms = scope.token.forms;

        function depdencencyMet(dependencies, type) {
          if (!dependencies) {
            return true;
          }
          var ok = true;
          for (var k in dependencies) {
            var condition;
            condition = checkAttribute(dependencies, k);
            condition = type ? condition : !condition;
            if (condition) {
              ok = false;
              break;
            }
          }
          return ok;
        }

        function checkAttribute(dependencies, attr) {
          var value = dependencies[attr];
          if (value === "*") {
            return angular.isDefined(scope.form.attributes[attr]);
          } else {
            return inArray(arethusaUtil.toAry(value), scope.form.attributes[attr]);
          }
        }

        function ifDependencyMet(dependencies) {
          return depdencencyMet(dependencies, false);
        }

        function unlessDependencyMet(dependencies) {
          return depdencencyMet(dependencies, true);
        }

        function rulesMet(rules) {
          // No rules, everything ok
          var isOk;
          if (!rules) {
            isOk = true;
          } else {
            for (var i = rules.length - 1; i >= 0; i--){
              var rule = rules[i];
              var ifDep = ifDependencyMet(rule['if']);
              var unDep = unlessDependencyMet(rule.unless);
              if (ifDep && unDep) {
                isOk = true;
                break;
              }
            }
          }
          return isOk;
        }

        function getVisibleAttributes() {
          return arethusaUtil.inject([], morph.postagSchema, function (memo, attr) {
            if (rulesMet(morph.rulesOf(attr))) {
              memo.push(attr);
            }
          });
        }

        function setVisibleAttributes() {
          scope.visibleAttributes = getVisibleAttributes();
        }

        function addLemmaHint() {
          lemmaForm.find('input').addClass('warn');
          translator('morph.lemmaHint', function(translation) {
            scope.lemmaHint = translation;
          });
        }

        function removeLemmaHint() {
          lemmaForm.find('input').removeClass('warn');
          scope.lemmaHint = '';
        }

        scope.declareOk = function() {
          removeLemmaHint();
        };

        scope.reset = function() {
          scope.resetAlert();
          addLemmaHint();
          morph.resetCustomForm(scope.token, scope.id);
        };

        scope.resetAlert = function() {
          scope.alert = false;
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

        // Most of this functionality should be moved into the service!
        function addForm() {
          var newForm = angular.copy(scope.form);
          scope.forms.push(newForm);
          morph.setState(scope.id, newForm);
          morph.addToLocalStorage(scope.token.string, newForm);
          propagateToEqualTokens(newForm);
          var str = state.asString(scope.id);
          var msg = scope.translations.createSuccess({ form: str });
          notifier.success(msg);
        }

        function propagateToEqualTokens(form) {
          var str = scope.token.string;
          angular.forEach(state.tokens, function(token, id) {
            if (id !== scope.id) {
              if (token.string === str) {
                var morphForm = morph.analyses[id];
                var newForm = angular.copy(form);
                newForm.selected = false;
                morphForm.forms.push(newForm);
                if (!morph.hasSelection(morphForm)) {
                  morph.setState(id, newForm);
                }
              }
            }
          });
        }

        scope.$watch('form.attributes', function (newVal, oldVal) {
          setVisibleAttributes();
        }, true);

        scope.$watch('token.customForm', function(newVal, oldVal) {
          scope.form = newVal;
        });

        element.on('show-mfc' + scope.id, function() {
          // This hardcodes the idea of a sidepanel. Might rethink how to do this
          // at a later stage.
          var container = angular.element(document.getElementById('sidepanel'));
          // We need to scroll to the first child - the element itself is placed
          // at a completely different place in the DOM.
          container.scrollTo(element.children(), 0, 500);
        });

        addLemmaHint();
      },
      templateUrl: 'templates/morph_form_create.html'
    };
  }
]);
