"use strict";

angular.module('arethusa.opendataNetwork').directive('graphSetting', function() {
  return {
    restrict: 'A',
    scope: {
      title: '@',
      value: '=',
      isInt : '@'
    },
    link: function(scope, element, attrs) {
      scope.inputVal = angular.copy(scope.value);
      scope.save = function() {
        var v = angular.copy(scope.inputVal);
        if(scope.isInt) {
          v = parseInt(v);
        }
        scope.value = v;
      };
    },
    templateUrl: 'templates/arethusa.opendata_network/graph_setting.html'
  };

});
