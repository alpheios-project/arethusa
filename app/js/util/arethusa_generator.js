"use strict";

// Generators for Arethusa code for things such as
// - useful directives

function ArethusaGenerator() {
  this.panelTrigger = function panelTrigger(service, trsl, trslKey, template) {
    return {
      restrict: 'A',
      compile: function(element) {
        function updateTitle(translation) {
          element.attr('title', translation);
        }

        return function link(scope, element, attrs) {
          function toggle() {
            scope.$apply(function() {
              element.toggleClass('on');
              service.toggle();
            });
          }

          trsl(trslKey, updateTitle);

          element.bind('click', toggle);
        };
      },
      template: template
    };
  };
}

var arethusaGenerator = new ArethusaGenerator();
var aG = arethusaGenerator;

