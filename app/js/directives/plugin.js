annotationApp.directive('plugin', function () {
  return {
    restrict: 'E',
    scope: true,
    controller: function($scope, $element, $attrs, $injector) {
      $scope.plugin = $injector.get($attrs.name);
    },
    template: '<div ng-include="plugin.template"></div>'
  };
});
