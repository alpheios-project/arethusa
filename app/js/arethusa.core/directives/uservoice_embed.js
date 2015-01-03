"use strict";

angular.module('arethusa.core').directive('uservoiceEmbed', [
  'translator',
  'uuid2',
  function(translator,uuid2) {
    return {
      restrict: 'A',
      scope: {
        target: "@"
      },
      link: function(scope, element, attrs) {
          // this is a little convoluted but we could have multiple
          // embedded uservoice elements so we need to be sure each
          // has a unique id
          var embedded_elem_id = "data-uv-embed-" + uuid2.newuuid();
          angular.forEach(element.children(), function(elem,i) {
            if (angular.element(elem).hasClass(scope.target)) {
              angular.element(elem).attr('id',embedded_elem_id);
            }
          });
          translator('errorDialog.sendMessage', function(translation) {
            scope.hint = translation();
            // it would be nice to do this as a result of the confirm modal action
            // but it's more work to include a screenshot of the error in that case
            // we could do this as custom key/value pair but we are only allowed one
            // and might hit field length limitations.
            UserVoice.push(['embed', '#'+embedded_elem_id, {
              mode: 'contact',
              contact_title: '',
              strings: { contact_message_placeholder: scope.hint }
            }]);
        });
      }
    };
  }
]);
