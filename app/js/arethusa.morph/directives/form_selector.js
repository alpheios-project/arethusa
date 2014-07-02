'use strict';
angular.module('arethusa.morph').directive('formSelector', function () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var id = scope.id;

      function action(event) {
        event.stopPropagation();
        scope.$apply(function() {
          if (scope.form.selected) {
            scope.plugin.unsetState(id);
          } else {
            scope.plugin.setState(id, scope.form);
          }
        });
      }

      scope.$watch('form.selected', function(newVal, oldVal) {
        scope.text = newVal ? 'D' : 'S';
      });

      element.bind('click', action);
    },
    template: '\
      <span\
        class="button micro radius"\
        ng-class="{ success: form.selected }">\
         {{ text }}\
      </span>\
    '
  };
});
