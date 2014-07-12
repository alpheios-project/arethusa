'use strict';

angular.module('arethusa.core').directive('langSpecific', [
  'languageSettings',
  function(languageSettings) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var settings = languageSettings.getFor('treebank') || languageSettings.getFor('hebrewMorph');
        if (settings) {
          element.attr('lang', settings.lang);
          element.attr('dir', settings.leftToRight ? 'ltr' : 'rtl');
          element.css('font-family', settings.font);
        }
      }
    };
  }
]);
