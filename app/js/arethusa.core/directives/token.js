'use strict';

// The directive currently looks at the depTree plugin to derive info whether
// the head of token can be changed through a click event or not.
//
// This is NOT a final solution, as it is flawed in several aspects.
// There might be no depTree plugin present at all - that way it will not
// be possible to check it. The way it is handled right now, this would
// lead to problems: Even if the depTree plugin isn't included in the
// application, the directive would still import it and be able to change heads,
// as 'editor' is the default mode of all plugins.
//
// The solution is to abstract plugin handling one step more. This has been planned
// for a while now, just never got the chance to really do it.
// Abstracting plugins will also clean up the MainCtrl, who has far too many
// responsibilites at the moment.
angular.module('arethusa.core').directive('token', [
  'state',
  'depTree',
  function (state, depTree) {
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
        if (!scope.token) return;
        if (!angular.isObject(scope.token)) {
          scope.token = state.getToken(scope.token);
        }

        scope.state = state;
        var id = scope.token.id;
        var changeHeads = depTree.mode === 'editor';

        function apply(fn) {
          scope.$apply(fn());
        }

        function bindClick() {
          element.bind('click', function (event) {
            apply(function() {
              var clickType = event.ctrlKey ? 'ctrl-click' : 'click';
              state.toggleSelection(id, clickType, changeHeads);
            });
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

        // Dependent on the concept of head changes - will be moved
        // elsewhere later.
        function bindHeadChangeHover() {
          element.bind('mouseenter', function (event) {
            apply(function() {
              if (awaitingHeadChange(event)) {
                element.addClass('copy-cursor');
              }
            });
          });
          element.bind('mouseleave', function () {
            apply(function () {
              element.removeClass('copy-cursor');
            });
          });
        }

        function awaitingHeadChange(event) {
          return !state.isSelected(id) && state.hasSelections() && !event.ctrlKey;
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

        // It's imperative to bind headChangeHover before Hover -
        // otherwise the headChangeHover bindings fails.
        if (scope.click) {
          bindClick();
          element.addClass('clickable');
          if (changeHeads) {
            bindHeadChangeHover();
          }
        }
        if (scope.hover) bindHover();

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
              element.removeAttr('style'); // css() only modifies properties!
              element.css(newVal);
            } else {
              cleanStyle();
            }
          }
        }, true);

        // Special handling of articial tokens
        if (scope.token.artificial) {
          element.addClass(scope.token.type);
        }

        element.addClass('token');
      },
      templateUrl: 'templates/token.html'
    };
  }
]);
