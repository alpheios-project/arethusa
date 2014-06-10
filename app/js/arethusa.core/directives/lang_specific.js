'use strict';

angular.module('arethusa.core').directive('langSpecific', [
  'languageSettings',
  function(languageSettings) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var settings = languageSettings.getFor('treebank');
        if (settings) {
          element.attr('lang', settings.lang);
          element.attr('dir', settings.leftToRight ? 'ltr' : 'rtl');
        }
      }
    };
  }
]);
