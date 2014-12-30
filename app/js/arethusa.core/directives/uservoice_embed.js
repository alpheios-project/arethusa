"use strict";

angular.module('arethusa.core').directive('uservoiceEmbed', [
  'translator',
  function(translator) {
    return {
      restrict: 'A',
      scope: {
        target: "@"
      },
      link: function(scope, element, attrs) {
          translator('errorDialog.sendMessage', function(translation) {
            scope.hint = translation();
            // it would be nice to do this as a result of the confirm modal action
            // but it's more work to include a screenshot of the error in that case
            // we could do this as custom key/value pair but we are only allowed one 
            // and might hit field length limitations.
            UserVoice.push(['embed', '#'+scope.target, { 
              mode: 'contact',  
              contact_title: '',
              strings: { contact_message_placeholder: scope.hint }
            }]);
        });
      }
    }; 
  }
]);
