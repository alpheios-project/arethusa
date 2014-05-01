"use strict";

annotationApp.directive('formSelector', function() {
  return {
    restrict: 'E',
    replace: true,
    controller: function($scope, $element, $attrs) {
      var id = $scope.id;
      var form = $scope.form;
      $scope.text = 'Select';
      $scope.action = function() {
        if ($scope.plugin.isFormSelected(id, form)) {
          $scope.text = "Select";
          $scope.plugin.unsetState(id);
        } else {
          $scope.text = "Deselect";
          $scope.plugin.setState(id, form);
        }
      };
    },
    template: '<span ng-click="action()">{{ text }}</span>'
  };
  
});
