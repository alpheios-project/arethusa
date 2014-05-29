"use strict";

angular.module('arethusa.relation').directive('nestedMenu', [
  '$compile',
  function($compile) {
    return {
      restrict: 'A',
      scope: {
        relation: '=',
        values: '=',
        label: '='
      },
      link: function(scope, element, attrs) {
        //var nestedHtml = '<ul nested-menu relation="relation" labels="labels"></ul>';

        //angular.forEach(scope.labels, function(obj, label) {
          //if (obj.nested) {
            //var li = angular.element('#' + label);
            //var childScope = scope.$new();
            //childScope.labels = obj.nested;
            //console.log(li);
            //console.log($compile(nestedHtml)(childScope));
            //li.append($compile(nestedHtml)(childScope));
          //}
        //});
        //console.log('1');
        var html = '<ul><li ng-repeat="(k, v) in values.nested" nested-menu relation="relation" label="k" values="v"></li></ul>';
        if (scope.values.nested) {
          element.append($compile(html)(scope));
        }
      },
      template: '{{ label }}'
    };
  }
]);
