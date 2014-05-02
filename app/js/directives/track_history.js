"use strict";

angular.module('arethusa').directive('trackHistory', function(history) {
return {
    restrict: 'A',
    controller: function($scope, $element, $attrs, $parse) {
      var attrs = $scope.$eval($attrs.trackHistory);
      var target = $scope[attrs.target];
      var property = $scope[attrs.property];
      $scope.$watch(attrs.value, function(newVal, oldVal) {
        if (oldVal !== newVal) {
          history.save(target, property, oldVal, newVal);
        }
      });
    },
  };
  
});
