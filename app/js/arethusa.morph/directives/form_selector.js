'use strict';
angular.module('arethusa.morph').directive('formSelector', function () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var id = scope.id;
      var form = scope.form;

      scope.isSelected = function() {
        return scope.plugin.isFormSelected(id, form);
      };

      scope.text = function () {
        return scope.isSelected() ? 'D' : 'S';
      };

      function action(event) {
        event.stopPropagation();
        scope.$apply(function() {
          if (scope.isSelected()) {
            scope.plugin.unsetState(id);
          } else {
            scope.plugin.setState(id, form);
          }
        });
      }

      element.bind('click', action);
    },
    template: '\
      <span\
        class="button micro radius"\
        ng-class="{success: isSelected()}">\
         {{ text() }}\
      </span>\
    '
  };
});
