"use strict";

angular.module('arethusa.core').directive('chunkModeSwitcher', [
  'navigator',
  'notifier',
  function(navigator, notifier) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.navi = navigator;
        scope.size = navigator.chunkSize;

        scope.tryToSetChunkSize = function() {
          var size = scope.size;
          if (navigator.chunkSize === size) {
            return;
          }
          if (size < 1 || size > 5) {
            notifier.error('Only chunk sizes between 1 and 5 are currently supported');
            scope.size = navigator.chunkSize;
          } else {
            navigator.changeChunkSize(scope.size);
          }
        };
      },
      templateUrl: 'templates/arethusa.core/chunk_mode_switcher.html'
    };
  }
]);
