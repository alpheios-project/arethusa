"use strict";

// This is a workaround for restrictions within the an accordion directive.
// An accordion-heading cannot receive a class before it's converted to a dd
// element (the foundation equivalent for an accordion-heading). We therefore
// place a class toggling directive onto a child element of it and set the class
// on the parent... Hacky, but effective.

angular.module('arethusa.morph').directive('accordionHighlighter', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var className = 'accordion-selected';

      scope.$watch('form.selected', function(newVal, oldVal) {
        if (newVal) {
          element.parent().addClass(className);
        } else {
          element.parent().removeClass(className);
        }
      });
    }
  };
});
