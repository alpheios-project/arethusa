"use strict";

angular.module('arethusa.core').directive('translateLanguage', [
  '$translate',
  function($translate) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        //function useKey(key) {
          //scope.langKey = key || $translate.use();
          //$translate.use(scope.langKey);
        //}

        //var langs = ['en', 'de'];

        //function toggleLang() {
          //var i;
          //i = langs.indexOf(scope.langKey) + 1;
          //i = i > langs.length - 1 ? 0 : i;
          //useKey(langs[i]);
        //}

        // Check the comment in arethusa.js to learn why this is commented out,
        // hardcoded to 'en' and hidden for now.
        //
        //element.bind('click', function() {
          //scope.$apply(toggleLang);
        //});

        //useKey();
        element.hide();
        $translate.use('en');
      },
      templateUrl: 'templates/arethusa.core/translate_language.html'
    };
  }
]);
