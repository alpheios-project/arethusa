'use strict';
angular.module('arethusa.core').directive('token', [
  'state',
  'keyCapture',
  function (state, keyCapture) {
    return {
      restrict: 'AE',
      scope: {
        token: '=',
        colorize: '=',
        click: '@',
        hover: '@',
        highlight: '@'
      },
      link: function (scope, element, attrs) {
        if (! scope.token) {
          return;
        }
        scope.state = state;
        var id = scope.token.id;
        function apply(fn) {
          scope.$apply(fn());
        }
        function bindClick() {
          element.bind('click', function () {
            if (keyCapture.isCtrlActive()) {
              apply(function () {
                state.toggleSelection(id, 'ctrl-click');
              });
            } else {
              apply(function () {
                state.toggleSelection(id, 'click');
              });
            }
          });
        }
        function bindHover() {
          element.bind('mouseenter', function () {
            apply(function () {
              state.selectToken(id, 'hover');
            });
          });
          element.bind('mouseleave', function () {
            apply(function () {
              state.deselectToken(id, 'hover');
            });
          });
        }
        function bindEscape() {
          keyCapture.onKeyPressed(keyCapture.keyCodes.esc, function() {
            apply(function() {
              state.deselectAll();
            });
          });
        }
        scope.selectionClass = function () {
          if (state.isSelected(id)) {
            if (state.selectionType(id) == 'hover') {
              return 'hovered';
            } else {
              return 'selected';
            }
          }
        };
        if (scope.click) {
          bindClick();
          bindEscape();
        }
        if (scope.hover) {
          bindHover();
        }
        function cleanStyle() {
          angular.forEach(scope.token.style, function (val, style) {
            element.css(style, '');
          });
        }
        // We have two possibilities here:
        // When the colorize contains an attribute, the user wants
        // to set a custom style.
        // When it was just a boolean value of true, we look if the
        // token itself contains style information.
        scope.$watch('colorize', function (newVal, oldVal) {
          if (newVal) {
            if (angular.isObject(newVal)) {
              element.css(newVal);
            } else {
              element.css(scope.token.style || {});
            }
          } else {
            cleanStyle();
          }
        });
        scope.$watch('token.style', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            if (newVal) {
              element.css(newVal);
            } else {
              cleanStyle();
            }
          }
        });
      },
      templateUrl: 'templates/token.html'
    };
  }
]);
