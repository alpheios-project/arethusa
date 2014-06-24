"use strict";

angular.module('arethusa.core').directive('rootToken', [
  'state',
  'depTree',
  function(state, depTree) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        function apply(fn) {
          scope.$apply(fn());
        }

        var changeHeads = depTree.mode === 'editor';

        element.bind('click', function() {
          apply(function() {
            if (changeHeads) {
              state.handleChangeHead('0000', 'click');
              state.deselectAll();
            }
          });
        });

        element.bind('mouseenter', function () {
          apply(function() {
            element.addClass('hovered');
          });
        });
        element.bind('mouseleave', function () {
          apply(function() {
            element.removeClass('hovered');
          });
        });
      }
    };
  }
]);
