'use strict';
angular.module('arethusa.contextMenu').directive('pluginContextMenu', function () {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    link: function (scope, element, attrs) {
      scope.plugin = scope.$eval(attrs.name);
    },
    template: '      <div id="{{ plugin.name }}-context-menu"         ng-include="plugin.contextMenuTemplate">      </div>    '
  };
});
