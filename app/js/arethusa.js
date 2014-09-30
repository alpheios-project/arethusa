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
  'LOCALES',
  'MAIN_ROUTE',
  'LANDING',
  function ($routeProvider, $translateProvider,
            LOCALES, MAIN_ROUTE, LANDING) {
    if (aU.isArethusaMainApplication()) {
      $routeProvider.when('/', LANDING);
      //$routeProvider.when('/conf_editor', CONF_ROUTE);
      $routeProvider.when('/:conf', MAIN_ROUTE);
      //$routeProvider.when('/conf_editor/:conf', CONF_ROUTE);
    }

    var localesMap = {};
    for (var i = LOCALES.length - 1; i >= 0; i--){
      var locale = LOCALES[i];
      localesMap[locale + '_*'] = locale;
    }

    $translateProvider
      .useStaticFilesLoader({
        prefix: arethusa.basePath + '/dist/i18n/',
        suffix: '.json'
      })

      .registerAvailableLanguageKeys(LOCALES, localesMap)
      .determinePreferredLanguage()
      .fallbackLanguage('en');
  },
]);

angular.module('arethusa').value('CONF_PATH', '../dist/configs');

function Arethusa() {
  var self = this;

  self.basePath = '..';

  function Api(injector) {
    var api = this;
    var $compile = injector.get('$compile');

    this.configurator = injector.get('configurator');

    this.configure = function(conf) {
      api.configurator.defineConfiguration(conf);
    };

    this.watchUrl = function(bool) {
      injector.get('locator').watchUrl(bool);
    };

    this.setBasePath = function(path) {
      injector.get('basePath').set(path);
    };

    this.setParams = function(a, b) {
      injector.get('locator').set(a, b);
    };

    this.compile = function(element) {
      var html = element[0].innerHTML;
      element.html($compile(html)(element.scope()));
    };

    this.state = injector.get('state');

    //this.setBasePath(self.basePath);
  }

  this.setConfPath = function(path) {
    angular.module('arethusa').value('CONF_PATH', path);
  };

  this.setBasePath = function(path) {
    self.basePath = path;
    angular.module('arethusa.core').value('BASE_PATH', path);
  };

  this.start = function(id, conf, params) {
    var res = {};
    id = id.match(/^#/) ? id : '#' + id;
    var target = angular.element(id);
    target.attr('ng-controller', 'ArethusaCtrl');
    target.ready(function() {
      var injector = angular.bootstrap(id, ['arethusa']);
      var api = new Api(injector);

      api.watchUrl(false);
      api.setParams(params);
      api.configure(conf);

      api.compile(target);

      angular.extend(res, api);
    });

    return res;
  };
}

var arethusa =  new Arethusa();
