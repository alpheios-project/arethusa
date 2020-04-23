'use strict';

/**
 * @ngdoc overview
 * @name arethusa
 *
 * @description
 * Arethusa's main module. Handles routing.
 *
 */
angular.module('arethusa', [
  'angulartics',
  'angulartics.google.analytics',
  'ngRoute',
  'arethusa.core',
  'arethusa.contextMenu',
  'arethusa.history',
  'arethusa.tools'
]);

angular.module('arethusa').constant('_', window._);

angular.module('arethusa').config([
  '$translateProvider',
  'localStorageServiceProvider',
  'LOCALES',
  function ($translateProvider, localStorageServiceProvider,
            LOCALES) {

    var localesMap = {};
    for (var i = LOCALES.length - 1; i >= 0; i--){
      var locale = LOCALES[i];
      localesMap[locale + '_*'] = locale;
    }

    $translateProvider
      .useStaticFilesLoader({
        prefix: window.i18npath,
        suffix: '.json'
      })

      .registerAvailableLanguageKeys(LOCALES, localesMap)
      .determinePreferredLanguage()
      .fallbackLanguage('en')
      .addInterpolation('translatorNullInterpolator');

    localStorageServiceProvider.setPrefix('arethusa');
  },
]).config([
  // This config prevents URL changes done using the browser's History API
  // from causing Angular to enter an infinite loop.
  // See https://stackoverflow.com/questions/18611214/turn-off-url-manipulation-in-angularjs
  '$provide',
  function ($provide) {
    $provide.decorator('$browser', ['$delegate', function ($delegate) {
      $delegate.onUrlChange = function () {};
      $delegate.url = function () { return '' };

      return $delegate;
    }]);
  }
]);

angular.module('arethusa').value('CONF_PATH', '/configs');

function Arethusa() {

  var self = this;

  this.on = function(id) {
    self.id = id.match(/^#/) ? id : '#' + id;
    var template = document.createElement("div");
    template.setAttribute("ng-include",'gS.layout.template');
    template.setAttribute("class",'fade slow');
    template.setAttribute("key-capture",'');
    var navbar = document.createElement("arethusa-navbar");
    template.appendChild(navbar);
    document.getElementById(self.id.slice(1)).appendChild(template);
    var target = angular.element(self.id);
    target.attr('ng-controller','ArethusaCtrl');
    return self;
  };

  this.from = function(url) {
    var arethusa = angular.module('arethusa');
    var arethusa_core = angular.module('arethusa.core');
    arethusa.value('CONF_PATH',url+"/configs");
    arethusa.value('BASE_PATH',url);
    arethusa_core.value('BASE_PATH',url);
    return self;
  };
  this.with = function(conf) {
    self.conf = conf.main ? $.when(conf) : $.getJSON(conf) ;
    return self;
  };
  this.start = function(resourceConf) {
    self.conf.then(function(conf) {
      var injector = angular.bootstrap(self.id,['arethusa']);
      var configurator = injector.get('configurator');
      self._api = injector.get('api')

      for (var k in resourceConf) {
        var locator = injector.get('locator');
        locator.watchUrl(false);
        locator.set(k, resourceConf[k]);
      }
      configurator.defineConfiguration(conf);
    });
  };

  this.api = function() {
    return this._api
  };
};
