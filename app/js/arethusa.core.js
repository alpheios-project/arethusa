/**
 * @ngdoc overview
 * @name arethusa.core
 *
 * @description
 * Module of Arethusa's core functionality
 */
angular.module('arethusa.core', [
  'angulartics',
  'angulartics.google.analytics',
  'arethusa.util',
  'ngResource',
  'ngCookies',
  'ngAnimate',
  'duScroll',
  'pascalprecht.translate',
  'toaster',
  'oc.lazyLoad',
  'gridster',
  'hljs',
  'mm.foundation',
  'LocalStorageModule',
  'angularUUID2'
])
  .value('BASE_PATH', '..')
  .constant('_', window._);
