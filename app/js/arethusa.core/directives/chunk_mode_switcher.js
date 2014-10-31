"use strict";

angular.module('arethusa.core').directive('chunkModeSwitcher', [
  'navigator',
  'notifier',
  'translator',
  function(navigator, notifier, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.navi = navigator;

        var tr = {};
        translator('navigator.chunkSizeError', tr, 'chunkSizeError');

        scope.$watch('navi.chunkSize', function(newVal) { scope.size = newVal; });

        scope.tryToSetChunkSize = function() {
          var size = scope.size;
          if (navigator.chunkSize === size) {
            return;
          }
          if (size < 1 || size > 5) {
            notifier.error(tr.chunkSizeError);
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
