"use strict";

angular.module('arethusa.core').directive('allMessagesTrigger', [
  'notifier',
  'translator',
  function(notifier, translator) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function toggle() {
          scope.$apply(notifier.togglePanel());
        }

        var parent = element.parent();
        translator('messages', function(translation) {
          parent.attr('title', translation);
        });

        element.bind('click', toggle);
      },
      template: '<i class="fi-mail"/>'
    };
  }
]);
