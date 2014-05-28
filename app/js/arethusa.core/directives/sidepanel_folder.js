'use strict';
angular.module('arethusa.core').directive('sidepanelFolder', function () {
  return {
    scope: true,
    link: function (scope, element, attrs) {
      element.on('click', function () {
        var get = function (el) {
          return angular.element(document.getElementById(el));
        };
        var main = get('main-body');
        var panel = get('sidepanel');
        var width = panel.width();
        var mainWidth = main.width();
        if (scope.folded) {
          main.width(mainWidth - width);
          panel.show();
          element.text('Fold Panel');
        } else {
          main.width(mainWidth + width);
          panel.hide();
          element.text('Show Panel');
        }
        scope.folded = !scope.folded;
      });
    }
  };
});