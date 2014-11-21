angular.module('arethusa.core', [
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
  'LocalStorageModule'
])
  .value('BASE_PATH', '..')
  .constant('_', window._);
