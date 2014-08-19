'use strict';
angular.module('arethusa.contextMenu').directive('pluginContextMenu', function () {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    template: '\
      <div id="{{ plugin.name }}-context-menu"\
        ng-include="plugin.contextMenuTemplate">\
      </div>\
    '
  };
});
