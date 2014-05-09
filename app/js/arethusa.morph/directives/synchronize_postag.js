"use strict";

// Don't like that this is practically the same as the fireEvent directive
// There has to be a better way.
angular.module('arethusa.morph').directive('synchronizePostag', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var vars = scope.$eval(attrs.synchronizePostag);
      var form = scope[vars.form];
      var attr = scope[vars.attr];
      scope.$watch(vars.val, function(newVal, oldVal) {
        if (oldVal !== newVal) {
          scope.plugin.updatePostag(form, attr, newVal);
        }
      });
    }
  };
});
