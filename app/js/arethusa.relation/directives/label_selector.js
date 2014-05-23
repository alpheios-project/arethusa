"use strict";

angular.module('arethusa.relation').directive('labelSelector', function () {
  return {
    restrict: 'AE',
    replace: true,
    controller: function($scope, $element, $attrs) {
      var id = $scope.id;
      var label = $scope.label;
      var labels = $scope.label.combinedLabels;
      console.log(labels);
      $scope.combineLabel = function() {
        var res = "";
        angular.forEach(labels, function(lab, i) {
          if (Object.keys(labels).length > 1 ) {
            res = res + '_' + lab;
            if (res[0] == '_') {
              res = res.substring(1);
            }
          } else {
            res = lab;
          }
        });
        $scope.label.label = res;
        return label;
      };
      $scope.selected = function() {
        return $scope.plugin.isLabelSelected(id, label.label);
      };
      $scope.text = function() {
        return $scope.selected() ? 'Deselect' : 'Select';
      };
      $scope.action = function(event) {
        event.stopPropagation();
        if ($scope.selected()) {
          $scope.plugin.unsetState(id);
        } else {
          $scope.plugin.setState(id, $scope.combineLabel());
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
