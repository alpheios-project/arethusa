"use strict";

angular.module('arethusa.constituents').directive('constituent', [

  function() {
    var parts = ['class', 'role'];

    return {
      restrict: 'A',
      scope: {
        constituent: '='
      },
      link: function(scope, element, attrs) {
        function buildLabel() {
          scope.label = arethusaUtil.inject([], parts, function(memo, part) {
            var p = scope.constituent[part];
            if (p) memo.push(p);
          }).join(' - ');
        }

        for (var i = parts.length - 1; i >= 0; i--) {
          var part = parts[i];
          scope.$watch('constituent.' + part, buildLabel);
        }
      },
      template: '<div class="center">{{ label }}</div>'
    };
  }
]);
