annotationApp.directive('plugin', function () {
  return {
    restrict: 'E',
    scope: true,
    controller: function($scope, $element, $attrs, $injector) {
      $scope.fetch = function() {
        $scope.plugin = $injector.get($attrs.name);
      };
    },
    template: '<div ng-init="fetch()" ng-include="plugin.template"></div>'
  };
});
