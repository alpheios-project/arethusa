"use strict";

angular.module('arethusa.core').directive('arethusaUser', [
  function() {
    return {
      restrict: 'A',
      scope: {
        user: '=arethusaUser',
        withMail: '@'
      },
      link: function(scope, element, attrs) {
        function nameToString() {
          var string = '';
          var user = scope.user;

          if (user.fullName) {
            string += user.fullName;
            if (user.name) string += ' (' + user.name + ')';
          } else {
            string += user.name;
          }

          scope.name = string;
        }

        // We could add watchers to the name properties of
        // the user and the user itself - but they are most
        // likely not going to change, so we don't for now.
        nameToString();
      },
      templateUrl: 'templates/arethusa.core/arethusa_user.html'
    };
  }
]);
