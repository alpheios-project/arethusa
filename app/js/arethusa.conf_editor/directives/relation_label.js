"use strict";

angular.module('arethusa.confEditor').directive('relationLabel', function() {
  return {
    restrict: 'A',
    scope: {
      label: '=relationLabel'
    },
    templateUrl: 'templates/configs/relation_label.html'
  };
});
