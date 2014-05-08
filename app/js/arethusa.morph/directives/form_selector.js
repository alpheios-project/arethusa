"use strict";

angular.module('arethusa.morph').directive('formSelector', function() {
  return {
    restrict: 'AE',
    replace: true,
    controller: function($scope, $element, $attrs) {
      var id = $scope.id;
      var form = $scope.form;
      $scope.selected = function() {
        return $scope.plugin.isFormSelected(id, form);
      };
      $scope.text = function() {
        return $scope.selected() ? 'Deselect' : 'Select';
      };
      $scope.action = function(event) {
        event.stopPropagation();
        if ($scope.selected()) {
          $scope.plugin.unsetState(id);
        } else {
          $scope.plugin.setState(id, form);
        }
      };
    },
    template: '<button class="tiny small"' +
                 'ng-click="action($event)"' +
                 'ng-class="{success: selected()}">' +
                 '{{ text() }}' +
               '</button>'
  };

});
