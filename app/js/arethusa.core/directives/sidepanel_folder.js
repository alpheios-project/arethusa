'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  function(sidepanel) {
    return {
      scope: {},
      link: function (scope, element, attrs) {
        function setIconClassAndText() {
          var icon = sidepanel.folded ? 'expand' : 'compress';
          var text = sidepanel.folded ? 'Show' : 'Fold';
          scope.iconClass = 'fi-arrows-' + icon;
          scope.text = text + " Panel";
        }

        element.on('click', function () {
          sidepanel.toggle();
          scope.$apply(setIconClassAndText());
        });

        scope.sp = sidepanel;

        scope.$watch('sp.folded', function(newVal, oldVal) {
          setIconClassAndText();
        });
      },
      template: '<i title="{{ text }}" ng-class="iconClass"/>'
    };
  }
]);
