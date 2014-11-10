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
        // remove focus so shortcut keys can work
        event.target.blur();
      }

      scope.$watch('form.selected', function(newVal, oldVal) {
        scope.iconClass = newVal ? 'minus' : 'plus';
        scope.title     = newVal ? 'deselect' : 'select';
      });

      element.bind('click', action);
    },
    template: '\
      <input\
        type="checkbox"\
        class="postag-selector"\
        ng-checked="form.selected">\
      </input>\
    '
  };
});
