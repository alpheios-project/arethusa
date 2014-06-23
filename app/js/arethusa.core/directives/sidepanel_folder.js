'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  function(sidepanel) {
    return {
      scope: {},
      link: function (scope, element, attrs) {
        function addText() {
          var text = sidepanel.folded ? 'Show Panel' : 'Fold Panel';
          element.text(text);
        }

        element.on('click', function () {
          sidepanel.toggle();
          addText();
        });

        scope.sp = sidepanel;

        scope.$watch('sp.folded', function(newVal, oldVal) {
          addText();
        });
      }
    };
  }
]);
