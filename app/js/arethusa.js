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
  'arethusa.artificialToken'
]);

angular.module('arethusa').config([
  '$routeProvider',
  '$translateProvider',
  'MAIN_ROUTE',
  'CONF_ROUTE',
  function ($routeProvider, $translateProvider, MAIN_ROUTE, CONF_ROUTE) {
    $routeProvider.when('/', MAIN_ROUTE);
    $routeProvider.when('/conf_editor', CONF_ROUTE);
    $routeProvider.when('/:conf', MAIN_ROUTE);
    $routeProvider.when('/conf_editor/:conf', CONF_ROUTE);

    $translateProvider
      .translations('en', {
        SEARCH_DOCUMENTS: 'Search for documents',
        LANGUAGE: 'Language'
      })

      .translations('de', {
        SEARCH_DOCUMENTS: 'Suche Dokumente',
        LANGUAGE: 'Sprache'
      })

      .determinePreferredLanguage()
      .fallbackLanguage('en');
  }
]);
