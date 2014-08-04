"use strict";

angular.module('arethusa.core').directive('helpTrigger', [
  'help',
  'translator',
  function(help, translator) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function toggle() {
          scope.$apply(help.toggle());
        }

        var parent = element.parent();
        translator('help', function(translation) {
          parent.attr('title', translation);
        });

        element.bind('click', toggle);
      }
    };
  }
]);
