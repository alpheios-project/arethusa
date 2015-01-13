'use strict';

angular.module('fileBrowserApp').directive('fileStats', [
  function() {
    return {
      restrict: 'A',
      scope: {
        stats: '=fileStats'
      },
      template: '' +
        '<span ng-if="stats">' +
          '{{ stats.size | bytes }}, last modified at {{ stats.mtime | date: "medium" }}' +
        '</span>'
    };
  }
]);
