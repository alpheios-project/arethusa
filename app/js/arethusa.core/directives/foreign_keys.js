'use strict';
angular.module('arethusa.core').directive('foreignKeys',[
  'keyCapture',
  'languageSettings',
  '$compile',
  'globalSettings',
  function (keyCapture, languageSettings, $compile, globalSettings) {
    return {
      restrict: 'A',
      scope: {
        ngChange: '&',
        ngModel: '@',
        foreignKeys: '='
      },
      link: function (scope, element, attrs) {
        scope.enabled = !globalSettings.disableKeyboardMappings;
        scope.element = element;

        var parent = scope.$parent;

        function extractLanguage() {
          return (languageSettings.getFor('treebank') || languageSettings.getFor('hebrewMorph') || {}).lang;
        }

        function lang() {
          return scope.foreignKeys || extractLanguage();
        }

        function activeLanguage() {
          return languageSettings.langNames[lang()];
        }

        // This will not detect changes right now
        function placeHolderText() {
          var language = activeLanguage();
          var status = scope.enabled ? 'enabled' : 'disabled';
          return  language ? language + ' input ' + status + '!' : '';
        }

        function broadcast(event) {
          scope.$broadcast('convertingKey', event.keyCode);
        }

        function appendCompiled(parent, elements) {
          angular.forEach(elements, function(el, i) {
            parent.append($compile(el)(scope));
          });
        }

        scope.togglerClass = function() {
          return scope.enabled ? 'success-message-dark' : 'error-message-dark';
        };

        function appendHelp() {
          if (!activeLanguage()) return;

          var parent = element.parent();
          var margin = element.css('margin');

          var trigger   = '<span ng-click="visible = !visible">⌨</span>';
          var toggler   = '\
            <span\
              ng-click="enabled = !enabled"\
              class="settings-span-button">\
              <i\
                ng-class="togglerClass()"\
                class="fa fa-power-off"/>\
            </span>\
          ';
          var help      = '<div foreign-keys-help/>';
          var newMargin = '<div style="margin: ' + margin + '"/>';


          element.css('margin', 0);
          appendCompiled(parent, [trigger, toggler, help]);
          parent.append(newMargin);
        }

        element.attr('placeholder', placeHolderText);
        appendHelp();

        function applyModifiedKey(parent, input, fK) {
          parent.$eval(scope.ngModel + ' = i + k', { i: input, k: fK });
          scope.ngChange();
        }

        scope.parseEvent = function (event, noApply) {
          var input = element[0].value;
          var l = lang();
          if (l) {
            var fK = keyCapture.getForeignKey(event, l);
            if (fK === false) {
              broadcast(event);
              return false;
            }
            if (fK === undefined) {
              return true;
            } else {
              broadcast(event);
              element.value = input + fK;

              // When we call this method from an ng-click we might
              // already be digesting!
              if (noApply) {
                applyModifiedKey(parent, input, fK);
              } else {
                scope.$apply(applyModifiedKey(parent, input, fK));
              }

              return false;
            }
          } else {
            return true;
          }
        };

        scope.$watch('enabled', function(newVal, oldVal) {
          if (newVal) {
            element.bind('keydown', scope.parseEvent);
          } else {
            element.unbind('keydown', scope.parseEvent);
          }
          element.attr('placeholder', placeHolderText);
        });
      }
    };
  }
]);
