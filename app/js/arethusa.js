'use strict';
angular.module('arethusa', [
  'angulartics',
  'angulartics.google.analytics',
  'mm.foundation',
  'ngRoute',
  'pascalprecht.translate',
  'arethusa.core',
  'arethusa.contextMenu',
  'arethusa.confEditor',
  'arethusa.morph',
  'arethusa.depTree',
  'arethusa.hist',
  'arethusa.review',
  'arethusa.search',
  'arethusa.exercise',
  'arethusa.relation',
  'arethusa.sg',
  'arethusa.text',
  'arethusa.hebrewMorph',
  'arethusa.artificialToken',
  'arethusa.comments'
]);

angular.module('arethusa').config([
  '$routeProvider',
  '$translateProvider',
  'MAIN_ROUTE',
  'CONF_ROUTE',
  function ($routeProvider, $translateProvider,
            MAIN_ROUTE, CONF_ROUTE) {
    $routeProvider.when('/', MAIN_ROUTE);
    $routeProvider.when('/conf_editor', CONF_ROUTE);
    $routeProvider.when('/:conf', MAIN_ROUTE);
    $routeProvider.when('/conf_editor/:conf', CONF_ROUTE);

    $translateProvider
      .useStaticFilesLoader({
        prefix: 'static/i18n/',
        suffix: '.json'
      })

      // Right now we only support English. Still many strings we need to
      // change to the new translate syntax. Once we've made progress with it,
      // we activate it again.
      // The reason we include it right now is that we want to use it for all
      // future strings. We're too far behind on l10n/i18n matters - don't want
      // to make the situation worse.
      //
      //.registerAvailableLanguageKeys(['en', 'de'], {
        //'en_*' : 'en',
        //'de_*' : 'de'
      //})
      //.determinePreferredLanguage()
      //.fallbackLanguage('en');
      .registerAvailableLanguageKeys(['en'])
      .preferredLanguage('en');
  },
]);
