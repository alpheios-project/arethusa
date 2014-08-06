'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  '$window',
  'translator',
  '$rootScope',
  function(sidepanel, $window, translator, $rootScope) {
    return {
      scope: {},
      link: function (scope, element, attrs) {
        var win = angular.element($window);

        scope.translations = {};
        translator('sidepanel.show', scope.translations, 'show');
        translator('sidepanel.fold', scope.translations, 'fold');

        scope.$watch('translations', function(newVal, oldVal) {
          if (newVal !== oldVal) {
            setIconClassAndTitle();
          }
        }, true);

        function setIconClassAndTitle() {
          var icon = sidepanel.folded ? 'expand' : 'compress';
          var text = sidepanel.folded ? 'show' : 'fold';
          var key  = arethusaUtil.formatKeyHint(sidepanel.activeKeys.toggle);
          scope.iconClass = 'fi-arrows-' + icon;
          element.attr('title', scope.translations[text] + " " + key);
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
