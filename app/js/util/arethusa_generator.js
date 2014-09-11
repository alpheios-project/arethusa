"use strict";

// Generators for Arethusa code for things such as
// - useful directives

function ArethusaGenerator() {
  this.panelTrigger = function panelTrigger(service, trsl, trslKey, template) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function toggle() {
          scope.$apply(service.toggle());
        }

        var parent = element.parent();
        trsl(trslKey, function(translation) {
          parent.attr('title', translation);
        });

        element.bind('click', toggle);
      },
      template: template
    };
  };
}

var arethusaGenerator = new ArethusaGenerator();
var aG = arethusaGenerator;

