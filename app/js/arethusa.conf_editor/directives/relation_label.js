'use strict';
angular.module('arethusa.confEditor').directive('relationLabel', [
  '$compile',
  function ($compile) {
    return {
      restrict: 'A',
      scope: { label: '=relationLabel' },
      link: function (scope, element, attrs) {
        scope.open = false;
        scope.toggleNesting = function () {
          scope.open = !scope.open;
        };
        var nestedLabels = '        <div class="row panel" ng-if="open" style="margin-left: 15px">          <div            relation-label="nestedLabel"            ng-repeat="(n, nestedLabel) in label.nested">          </div>        </div>      ';
        if (scope.label.nested) {
          element.append($compile(nestedLabels)(scope));
        }
      },
      templateUrl: 'templates/configs/relation_label.html'
    };
  }
]);