'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  '$window',
  function(sidepanel, $window) {
    return {
      scope: {},
      link: function (scope, element, attrs) {
        var win = angular.element($window);

        function setIconClassAndTitle() {
          var icon = sidepanel.folded ? 'expand' : 'compress';
          var text = sidepanel.folded ? 'Show' : 'Fold';
          var key  = arethusaUtil.formatKeyHint(sidepanel.activeKeys.toggle);
          scope.iconClass = 'fi-arrows-' + icon;
          element.attr('title', text + " Panel " + key);
        }

        element.on('click', function () {
          sidepanel.toggle();
          scope.$apply(setIconClassAndTitle());
        });

        scope.sp = sidepanel;

        scope.$watch('sp.folded', function(newVal, oldVal) {
          setIconClassAndTitle();
          win.trigger('resize');
        });
      },
      template: '<i ng-class="iconClass"/>'
    };
  }
]);
