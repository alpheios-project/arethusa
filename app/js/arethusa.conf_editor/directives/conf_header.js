'use strict';
angular.module('arethusa.confEditor').directive('confHeader', function () {
  return {
    restrict: 'AE',
    scope: {
      name: '=',
      remover: '&'
    },
    templateUrl: 'js/conf_editor/templates/conf_header.html'
  };
});