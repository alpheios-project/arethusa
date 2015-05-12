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
  'globalSettings',
  function (state, globalSettings) {
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

        function apply(fn) {
          scope.$apply(fn());
        }

        function bindClick() {
          element.bind('click', function (event) {
            apply(function() {
              var clickType = event.ctrlKey ? 'ctrl-click' : 'click';
              if (clickType === 'click' && state.hasClickSelections()) {
                globalSettings.clickFn(id);
              } else {
                state.toggleSelection(id, clickType);
              }
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

        scope.selectionClass = function () {
          if (state.isSelected(id)) {
            if (state.selectionType(id) == 'hover') {
              return 'hovered';
            } else {
              return 'selected';
            }
          }
        };

        function bindPreClick() {
          var preClick = globalSettings.preClickFn;
          if (preClick) {
            angular.forEach(preClick, function(fn, eventName) {
              element.bind(eventName, function(event) {
                apply(function() {
                  fn(id, element, event);
                });
              });
            });
          }
        }

        function addBindings() {
          // It's imperative to bind any preClickFn which might hover here -
          // otherwise it will fail to register
          if (scope.click) {
            bindClick();
            element.addClass('clickable');
            bindPreClick();
          }
          if (scope.hover) bindHover();
        }

        function unbind() {
          element.removeClass('clickable');
          element.unbind();
        }

        function updateBindings() {
          unbind();
          addBindings();
        }

        scope.$on('clickActionChange', updateBindings);


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

        addBindings();
      },
      templateUrl: 'templates/token.html'
    };
  }
]);
