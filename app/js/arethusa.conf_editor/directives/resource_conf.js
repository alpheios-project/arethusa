'use strict';
angular.module('arethusa.confEditor').directive('resourceConf', function () {
  return {
    restrict: 'AE',
    scope: {
      name: '=',
      resource: '=',
      remover: '&'
    },
    link: function (scope, element, attrs) {
      var params = scope.resource.params;
      scope.addResourceParam = function (param) {
        params.push(param);
      };
      scope.removeResourceParam = function (param) {
        params.splice(params.indexOf(param), 1);
      };
    },
    templateUrl: 'templates/conf_editor/resource_conf.html'
  };
});