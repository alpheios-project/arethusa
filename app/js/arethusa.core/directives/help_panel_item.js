"use strict";

angular.module('arethusa.core').directive('helpPanelItem', [
  function() {
    return {
      restrict: 'A',
      scope: true,
      transclude: true,
      link: function(scope, element, attrs) {
        scope.toggler = attrs.toggler;
        scope.heading = attrs.heading;
        scope.height  = attrs.height;
      },
      templateUrl: 'templates/arethusa.core/help_panel_item.html'
    };
  }
]);
