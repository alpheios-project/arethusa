"use strict";

angular.module('arethusa.confEditor').directive('templateForm', function() {
  return {
    restrict: 'E',
    scope: {
      text: '@',
      model: '='
    },
    template: '<form>' +
                '<label>{{ text }}' +
                  '<input type="text" ng-model="model" class="columns small-6"/>' +
                '</label>' +
              '</form>'
  };
});
