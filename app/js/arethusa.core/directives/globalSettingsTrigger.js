"use strict";

angular.module('arethusa.core').directive('globalSettingsTrigger', [
  'globalSettings',
  'translator',
  function(globalSettings, translator) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function toggle() {
          scope.$apply(globalSettings.toggle());
        }

        var parent = element.parent();
        translator('globalSettings.title', function(translation) {
          parent.attr('title', translation);
        });

        element.bind('click', toggle);
      },
      template: '<i class="fi-widget"/>'
    };
  }
]);
