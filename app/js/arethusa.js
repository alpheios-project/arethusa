'use strict';
angular.module('arethusa', [
  'angulartics',
  'angulartics.google.analytics',
  'mm.foundation',
  'ngRoute',
  'arethusa.core',
  'arethusa.contextMenu',
  'arethusa.history'
]);

angular.module('arethusa').config([
  '$routeProvider',
  '$translateProvider',
  'MAIN_ROUTE',
  function ($routeProvider, $translateProvider,
            MAIN_ROUTE) {
    $routeProvider.when('/', MAIN_ROUTE);
    //$routeProvider.when('/conf_editor', CONF_ROUTE);
    $routeProvider.when('/:conf', MAIN_ROUTE);
    //$routeProvider.when('/conf_editor/:conf', CONF_ROUTE);

    $translateProvider
      .useStaticFilesLoader({
        prefix: 'static/i18n/',
        suffix: '.json'
      })

      .registerAvailableLanguageKeys(['en', 'de'], {
        'en_*' : 'en',
        'de_*' : 'de'
      })
      .determinePreferredLanguage()
      .fallbackLanguage('en');
  },
]);
