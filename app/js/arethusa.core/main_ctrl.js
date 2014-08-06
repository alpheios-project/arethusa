'use strict';
angular.module('arethusa.core').controller('MainCtrl', [
  '$scope',
  'configurator',
  'state',
  'documentStore',
  'notifier',
  'saver',
  'history',
  'plugins',
  'translator',
  function ($scope, configurator, state, documentStore, notifier,
            saver, history, plugins, translator) {
    // This is the entry point to the application.

    var translations = {};
    translator('loadInProgress', translations, 'loadInProgress');
    translator('loadComplete', translations, 'loadComplete');

    notifier.info(translations.loadInProgress);

    documentStore.reset();
    $scope.aU = arethusaUtil;
    $scope.debug = false;
    $scope.toggleDebugMode = function () {
      $scope.debug = !$scope.debug;
    };

    var conf = configurator.configurationFor('main');

    $scope.state = state;
    $scope.plugins = plugins;
    $scope.template = conf.template;

    // The application has to fulfil a specific load order.
    // The MainCtrl starts his work only when the configurator has received
    // its main configuration file (handled by the MAIN_ROUTE constant).
    //
    // The configurator might need some time to bring in external additional
    // files - asynchronously. We don't want the application to continue until
    // all configuration files are loaded.
    // We therefore wait for an event broadcast by the configurator to get a
    // green light.
    // Loading all state retrievers is another asynchronous step we want to see
    // completed before going on.
    // State broadcasts another event when it is done, after that the MainCtrl
    // can finally start to initialize itself and all all participating plugins.
    //
    // Everytime the state is reloaded, we need to reinitialize plugins (if they
    // declare to do so by implementing an init() function- it's not a necessity),
    // so that they can update their internal state after the main state tokens
    // have changed. There is no need to reinit the MainCtrl - the arethusaLoaded
    // variable takes care of this.
    // However if we reload a configuration, MainCtrl needs to be re-initialized
    // as well - the plugins participating in an editing session might have
    // changed completely. Therefore, the confLoaded event sets arethusaLoaded to
    // false every time it's triggered.
    $scope.$on('confLoaded', function () {
      state.arethusaLoaded = false;
      state.init();
      history.init();
    });

    $scope.$on('stateLoaded', function () {
      state.postInit();
      if (state.arethusaLoaded) {
        // We don't have to retrieve all plugins again, but we have
        // to reload them so that they can update their internal state
        plugins.init();
      } else {
        $scope.init();
      }
    });

    $scope.init = function () {
      plugins.start(conf.plugins);
      notifier.init(); // also clears the Loading message for now.
      saver.init();
      state.arethusaLoaded = true;
      notifier.success(translations.loadComplete);
      UserVoice.push(['addTrigger', '#uservoicebutton', { mode: 'contact' }]);

      // start listening for events
      state.silent = false;
    };
  }
]);
