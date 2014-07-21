'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  '$window',
  function(sidepanel, $window) {
    return {
      scope: {},
      link: function (scope, element, attrs) {
        var win = angular.element($window);

        function setIconClassAndText() {
          var icon = sidepanel.folded ? 'expand' : 'compress';
          var text = sidepanel.folded ? 'Show' : 'Fold';
          var key  = arethusaUtil.formatKeyHint(sidepanel.activeKeys.toggle);
          scope.iconClass = 'fi-arrows-' + icon;
          scope.text = text + " Panel " + key;
        }

        element.on('click', function () {
          sidepanel.toggle();
          scope.$apply(setIconClassAndText());
        });

        scope.sp = sidepanel;

        scope.$watch('sp.folded', function(newVal, oldVal) {
          setIconClassAndText();
          win.trigger('resize');
        });
      },
      template: '<i title="{{ text }}" ng-class="iconClass"/>'
    };
  }
]);
