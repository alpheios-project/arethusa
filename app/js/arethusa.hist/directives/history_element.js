'use strict';
angular.module('arethusa.hist').directive('historyElement', function () {
  return {
    restrict: 'A',
    scope: { historyElement: '=' },
    link: function (scope, element, attrs) {
      var el = scope.historyElement;
      var year = el.time.getFullYear();
      var month = el.time.getMonth() + 1;
      var day = el.time.getDate();
      scope.output = el.property + ' changed from ' + el.oldVal + ' to ' + JSON.stringify(el.newVal, null, 2) + ' in object ' + JSON.stringify(el.target, null, 2) + ' at ' + [
        year,
        month,
        day
      ].join('/');
    },
    template: '<span>{{ output }}</span>'
  };
});