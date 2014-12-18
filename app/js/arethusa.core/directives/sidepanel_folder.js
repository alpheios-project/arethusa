'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  '$window',
  'translator',
  function(sidepanel, $window, translator) {
    return {
      scope: {},
      link: function (scope, element, attrs) {
        var win = angular.element($window);

        scope.translations = translator({
          'sidepanel.show': 'show',
          'sidepanel.fold': 'fold'
        });

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
          element.attr('title', scope.translations[text]() + " " + key);
        }

        element.on('click', function () {
          sidepanel.toggle();
          scope.$apply(setIconClassAndTitle());
        });

        scope.sp = sidepanel;

        var foldWatch = function() {};
        scope.$watch('sp.active', function(newVal) {
          if (newVal) {
            element.show();
            foldWatch = scope.$watch('sp.folded', function(newVal, oldVal) {
              setIconClassAndTitle();
              win.trigger('resize');
            });
          } else {
            element.hide();
            foldWatch();
          }
        });
      },
      template: '<i ng-class="iconClass"/>'
    };
  }
]);
