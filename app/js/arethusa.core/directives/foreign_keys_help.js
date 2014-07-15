'use strict';
angular.module('arethusa.core').directive('foreignKeysHelp', [
  'keyCapture',
  function(keyCapture) {
    return {
      restrict: 'AE',
      link: function(scope, element, attr) {
        scope.kC = keyCapture;
        scope.keys = keyCapture.mappedKeyboard('gr');
      },
      templateUrl: './templates/arethusa.core/foreign_keys_help.html'
    };
  }
]);
