'use strict';
angular.module('arethusa.core').controller('ArethusaCtrl', [
  'GlobalErrorHandler',
  '$scope',
  'configurator',
  'state',
  'documentStore',
  'notifier',
  'saver',
  'history',
  'plugins',
  'translator',
  '$timeout',
  'globalSettings',
  function (GlobalErrorHandler, $scope, configurator, state, documentStore, notifier,
            saver, history, plugins, translator, $timeout, globalSettings) {
    // This is the entry point to the application.

    var translations = translator(['loadInProgress', 'loadComplete']);

    $scope.$on('confLoaded', bootstrap);

    function bootstrap() {
      documentStore.reset();
      $scope.aU = arethusaUtil;
      $scope.debug = false;
      $scope.toggleDebugMode = function () {
        $scope.debug = !$scope.debug;
      };

      var conf = configurator.configurationFor('main');

      $scope.state = state;
      $scope.plugins = plugins;
      $scope.gS = globalSettings;

      // The application has to fulfil a specific load order.
      // The ArethusaCtrl starts his work only when the configurator has received
      // its main configuration file (handled by the MAIN_ROUTE constant).
      //
      // Loading all state retrievers is an asynchronous step we want to see
      // completed before going on.
      // State broadcasts another event when it is done, after that the ArethusaCtrl
      // can finally start to initialize itself and all all participating plugins.
      //
      // Everytime the state is reloaded, we need to reinitialize plugins (if they
      // declare to do so by implementing an init() function- it's not a necessity),
      // so that they can update their internal state after the main state tokens
      // have changed. There is no need to reinit the ArethusaCtrl - the arethusaLoaded
      // variable takes care of this.
      //
      //
      // Note that this was much more complex (and clever) at an earlier stage, but was refactored
      // in http://github.com/latin-language-toolkit/arethusa/pull/365
      //
      // In case we every need this added complexity again, check out this PR to find
      // some advice.

      // The timeout helps to load the translation, otherwise we can't see a
      // notification that the load is in progress.
      $timeout(function() {
        notifier.init();
        notifier.wait(translations.loadInProgress());
        state.arethusaLoaded = false;
        state.init();
        saver.init();
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
        plugins.start(conf.plugins).then(function() {
          state.arethusaLoaded = true;
          notifier.success(translations.loadComplete());

          if (aU.isArethusaMainApplication()) {
            UserVoice.push(['addTrigger', '#uservoicebutton', { mode: 'contact' }]);
          }

          // start listening for events
          state.silent = false;
        });
      };
    }
  }
]);
