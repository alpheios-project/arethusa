"use strict";

angular.module('arethusa.core').directive('uservoiceTrigger', [
  'translator',
  function(translator) {
    return {
      restrict: 'A',
      compile: function(element, attributes) {
        element.attr('id', 'uservoicebutton');
        element.attr('data-uv-trigger', 'contact');

        return function link(scope, element) {
          var parent = element.parent();
          translator('contactUs', function(translation) {
            parent.attr('title', translation);
          });
        };
      },
      template: '<i class="fi-comment"/>'
    };
  }
]);
