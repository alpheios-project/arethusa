"use strict";

// Generators for Arethusa code for things such as
// - useful directives

function ArethusaGenerator() {
  this.panelTrigger = function (conf) {
    return {
      restrict: 'A',
      compile: function(element) {
        function updateTitle(translation) {
          element.attr('title', translation);
        }

        return function link(scope, element, attrs) {
          function toggle() {
            scope.$apply(function() {
              element.toggleClass('on');
              conf.service.toggle();
            });
          }

          conf.trsl(conf.trslKey, updateTitle);

          element.bind('click', toggle);
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

        scope.$on('keysAdded', function(_, keys) {
          var sel = keys.history;
          if (sel) {
            hint = aU.formatKeyHint(sel[type]);
            setTitle();
          }
        });

        translator('history.' + type, function(translation) {
          trsl = translation;
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

var arethusaGenerator = new ArethusaGenerator();
var aG = arethusaGenerator;

