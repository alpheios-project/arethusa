'use strict';
angular.module('arethusa.morph').directive('formSelector', [
  'morph',
  function (morph) {
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

        function checkMode() {
          if (morph.canEdit() === 'editor') {
            scope.editsAllowed = true;
          }
        }

        // This event doesn't exist right now. Once
        // we add support to change modes on the fly
        // it will be broadcasted through $rootScope.
        scope.$on('modeChanged', checkMode);
        checkMode();
      },
      template: '\
        <input\
          ng-if="editsAllowed"\
          type="checkbox"\
          class="postag-selector"\
          ng-checked="form.selected">\
        </input>\
      '
    };
  }
]);
