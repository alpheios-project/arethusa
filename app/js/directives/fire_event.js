"use strict";

angular.module('arethusa').directive('fireEvent', function(state) {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs) {
      var attrs = $scope.$eval($attrs.fireEvent);
      var target = $scope[attrs.target];
      var property = $scope[attrs.property];
      $scope.$watch(attrs.value, function(newVal, oldVal) {
        if (oldVal !== newVal) {
          state.fireEvent(target, property, newVal);
        }
      });
    },
  };
});
