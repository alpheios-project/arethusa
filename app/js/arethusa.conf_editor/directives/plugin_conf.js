"use strict";

angular.module('arethusa.confEditor').directive('pluginConf', function() {
  return {
    restrict: 'AE',
    scope: {
      // name needs a two-way binding, @ won't cut it, as we need its evaluated
      // value inside the link function already. @ would only resolve it during
      // the next compile cycle - the template would still be able to read it.
      name: '=',
      conf: '=',
      remover: '&'
    },
    link: function(scope, element, attrs) {
      // Right now paths to such configuration are hardcoded to a specific
      // folder. This will be much more dynamic in the future.
      scope.template = 'templates/configs/' + scope.name + '.html';
    },
    templateUrl: 'templates/plugin_conf.html'
  };
});
