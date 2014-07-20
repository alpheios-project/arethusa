"use strict";

angular.module('arethusa.core').directive('translateLanguage', [
  '$translate',
  function($translate) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.langKey = $translate.use();

        var langs = ['en', 'de'];

        function toggleLang() {
          var i;
          i = langs.indexOf(scope.langKey) + 1;
          i = i > langs.length - 1 ? 0 : i;
          var lang = langs[i];
          scope.langKey = lang;
          $translate.use(lang);
        }

        element.bind('click', function() {
          scope.$apply(toggleLang);
        });
      },
      templateUrl: 'templates/arethusa.core/translate_language.html'
    };
  }
]);
