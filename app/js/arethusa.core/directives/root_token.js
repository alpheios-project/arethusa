"use strict";

// The root token is only relevant in a dependency tree context -
// it's therefore completely valid to hardcode a few things here and
// not react to dynamic click handle changes.
angular.module('arethusa.core').directive('rootToken', [
  'state',
  'globalSettings',
  'depTree',
  function(state, globalSettings, depTree) {
    return {
      restrict: 'A',
      scope: {
        id: '@rootId',
        sentenceId: '@'
      },
      link: function(scope, element, attrs) {
        var actionName = 'change head';

        function apply(fn) {
          scope.$apply(fn());
        }

        function hoverActions() {
          return globalSettings.clickActions[actionName][1];
        }

        function doHoverAction(type, event) {
          if (globalSettings.clickAction === actionName) {
            hoverActions()[type](scope.id, element, event);
          }
        }

        function MockToken() {
          this.id = scope.id;
          this.sentenceId = scope.sentenceId;
        }

        element.bind('click', function() {
          if (globalSettings.clickAction === actionName) {
            apply(function() {
              depTree.changeHead(new MockToken());
            });
          }
        });

        element.bind('mouseenter', function (event) {
          apply(function() {
            element.addClass('hovered');
            doHoverAction('mouseenter', event);
          });
        });
        element.bind('mouseleave', function (event) {
          apply(function() {
            element.removeClass('hovered');
            doHoverAction('mouseleave', event);
          });
        });
      }
    };
  }
]);
