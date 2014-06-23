'use strict';

angular.module('arethusa.core').directive('sidepanelFolder', [
  'sidepanel',
  function(sidepanel) {
    return {
      link: function (scope, element, attrs) {
        function addText() {
          var text = sidepanel.folded ? 'Show Panel' : 'Fold Panel';
          element.text(text);
        }

        element.on('click', function () {
          sidepanel.toggle();
          addText();
        });

        addText();
      }
    };
  }
]);
