'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  function(sidepanel) {
    return {
      scope: {},
      link: function (scope, element, attrs) {
        function setIconClass() {
          var icon = sidepanel.folded ? 'compress' : 'expand';
          scope.iconClass = 'fi-arrows-' + icon;
        }

        element.on('click', function () {
          sidepanel.toggle();
          setIconClass();
        });

        scope.sp = sidepanel;

        scope.$watch('sp.folded', function(newVal, oldVal) {
          setIconClass();
        });
      },
      template: '<i ng-class="iconClass"/>'
    };
  }
]);
