"use strict";

angular.module('arethusa.core').directive('delimiter', function() {
  return {
    restrict: 'A',
    replace: true,
    template: '<div class="small-12 columns" style="padding: 0.5rem 0"/>'
  };
});
