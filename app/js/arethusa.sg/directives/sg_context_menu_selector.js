"use strict";

angular.module('arethusa.sg').directive('sgContextMenuSelector', [
  'sg',
  function(sg) {
    return {
      restrict: 'A',
      scope: {
        obj: '='
      },
      link: function(scope, element, attrs) {
        scope.sg = sg;

        function ancestorChain(chain) {
          return arethusaUtil.map(chain, function(el) {
            return el.short;
          }).join(' > ');
        }

        scope.$watchCollection('obj.ancestors', function(newVal, oldVal) {
          scope.heading = (newVal.length === 0) ?
            'Select Smyth Categories' :
            ancestorChain(newVal);
        });
      },
      templateUrl: 'templates/arethusa.sg/sg_context_menu_selector.html'
    };
  }
]);
