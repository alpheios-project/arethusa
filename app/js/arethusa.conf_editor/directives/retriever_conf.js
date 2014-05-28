'use strict';
angular.module('arethusa.confEditor').directive('retrieverConf', function () {
  return {
    restrict: 'AE',
    scope: {
      name: '=',
      retriever: '=',
      remover: '&'
    },
    link: function (scope, element, attrs) {
      var retr = scope.retriever;
      scope.addResource = function (name) {
        scope.retr.push(name);
      };
      scope.removeResource = function (name) {
        retr.splice(retr.indexOf(name), 1);
      };
    },
    templateUrl: 'templates/conf_editor/retriever_conf.html'
  };
});