"use strict";

// Generators for Arethusa code for things such as
// - useful directives

angular.module('arethusa.util').service('generator', [
  function ArethusaGenerator() {
    this.panelTrigger = function (conf) {
      return {
        restrict: 'A',
        compile: function(element) {
          var hint;

          function updateTitle(translation) {
            var title = translation();
            if (hint) title += ' (' + hint + ')';
            element.attr('title', title);
          }

          return function link(scope, element, attrs) {
            function executeToggle() {
              element.toggleClass('on');
              conf.service.toggle();
            }

            function toggle() {
              // Need to check for a running digest. When we trigger this
              // function through a hotkey, the keyCapture service will
              // have launched a digest already.
              if (scope.$$phase) {
                executeToggle();
              } else {
                scope.$apply(executeToggle);
              }
            }

            conf.trsl(conf.trslKey, updateTitle);

            element.bind('click', toggle);

            if (conf.kC) {
              var keys = conf.kC.initCaptures(function(kC) {
                var mapping = {};
                mapping[conf.mapping.name] = [
                  kC.create('toggle', function() { toggle(); }, conf.mapping.key)
                ];
                return mapping;
              });

              hint = keys[conf.mapping.name].toggle;
            }
          };
        },
        template: conf.template
      };
    };

    this.historyTrigger = function (history, translator, type, icon) {
      // type is either undo or redo
      icon = icon || type;
      return {
        restrict: 'A',
        scope: {},
        link: function(scope, element, attrs) {
          scope.history = history;

          scope.$watch('history.mode', function(newVal, oldVal) {
            if (newVal === 'editor') {
              element.show();
            } else {
              element.hide();
            }
          });

          scope.$watch('history.can' + aU.capitalize(type), function(newVal, oldVal) {
            if (newVal) {
              element.removeClass('disabled');
            } else {
              element.addClass('disabled');
            }
          });

          element.bind('click', function() {
            scope.$apply(history[type]());
          });


          var trsl, hint;

          scope.$watch('history.activeKeys.' + type, function(key) {
            if (key) {
              hint = aU.formatKeyHint(key);
              setTitle();
            }
          });

          translator('history.' + type, function(translation) {
            trsl = translation();
            setTitle();
          });

          function setTitle() {
            element.attr('title', trsl + ' ' + hint);
          }
        },
        template: '<i class="fa fa-' + icon + '"/>'
      };
    };
  }
]);

