"use strict";

angular.module('arethusa.core').directive('chunkModeSwitcher', [
  'navigator',
  'notifier',
  'translator',
  function(navigator, notifier, translator) {
    var MAX_CHUNK_SIZE = 10;
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.navi = navigator;

        var tr = translator({
          'navigator.chunkSizeError':  'chunkSizeError'
        });

        scope.$watch('navi.chunkSize', function(newVal) { scope.size = newVal; });

        scope.tryToSetChunkSize = function() {
          var size = scope.size;
          if (navigator.chunkSize === size) {
            return;
          }
          if (size < 1 || size > MAX_CHUNK_SIZE) {
            notifier.error(tr.chunkSizeError({ max: MAX_CHUNK_SIZE }));
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
