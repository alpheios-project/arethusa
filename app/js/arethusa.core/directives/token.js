"use strict";

angular.module('arethusa.core').directive('token', function(state) {
  return {
    restrict: 'AE',
    scope: {
      token: '=',
      colorize: '@',
      click: '@',
      hover: '@',
      highlight: '@'
    },
    link: function(scope, element, attrs) {
      scope.state = state;

      var id = scope.token.id;
      function apply(fn) {
        scope.$apply(fn());
      }

      function bindClick() {
        element.bind('click', function() {
          apply(function() {
            state.toggleSelection(id, 'click');
          });
        });
      }

      function bindHover() {
        element.bind('mouseenter', function() {
          apply(function() {
            state.selectToken(id, 'hover');
          });
        });
        element.bind('mouseleave', function() {
          apply(function() {
            state.deselectToken(id, 'hover');
          });
        });
      }

      scope.isSelected = function() {
        return state.isSelected(id);
      };

      if (scope.click) {
        bindClick();
      }

      if (scope.hover) {
        bindHover();
      }

      scope.$watch('colorize', function(newVal, oldVal) {
        if (newVal) {
          element.css(scope.token.style || {});
        } else {
          angular.forEach(scope.token.style, function(val, style) {
            element.css(style, '');
          });
        }
      });
    },
    templateUrl: 'templates/token.html'
  };
});
