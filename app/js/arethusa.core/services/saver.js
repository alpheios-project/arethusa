"use strict";

angular.module('arethusa.core').service('saver', [
  'configurator',
  'notifier',
  'keyCapture',
  'state',
  '$rootScope',
  '$window',
  'translator',
  '$analytics',
  'exitHandler',
  function(
    configurator,
    notifier,
    keyCapture,
    state,
    $rootScope,
    $window,
    translator,
    $analytics,
    exitHandler
  ) {

    var SUCCESS_EVENT = 'saveSuccess';

    var self = this;
    var conf, persisters;

    var translations = translator({
      'saver.success': 'success',
      'saver.error': 'error',
      'saver.inProgress': 'inProgress',
      'saver.nothingToSave': 'nothingToSave',
      'saver.confirmNote': 'confirmNote',
      'saver.confirmQuestion': 'confirmQuestion'
    });

    function getPersisters() {
      conf = configurator.configurationFor('main');
      return configurator.getPersisters(conf.persisters);
    }

    function getOutputters() {
      var fromPersisters = aU.inject({}, persisters, function(memo, name, persister) {
        if (angular.isFunction(persister.output)) memo[name] = persister;
      });
      return angular.extend(fromPersisters, configurator.getPersisters(conf.outputters));
    }

    function getPersistersAndOutputters() {
      persisters = getPersisters();
      self.outputters = getOutputters();
    }

    function hasPersisters() {
      return !angular.equals({}, persisters);
    }

    function updateStatus() {
      if (hasPersisters() && canEdit()) {
        self.canSave = true;
      }
    }

    function canEdit() {
      return configurator.mode() === 'editor';
    }

    function reset() {
      self.canSave = false;
    }

    // We only have one persister right now, later we'll want
    // to handle the success notification better.
    function success(res) {
      self.needsSave = false;
      $rootScope.$broadcast(SUCCESS_EVENT);
      notifier.success(translations.success());
    }

    function error(res) {
      // Can't figure out why we return 406 from our development server
      // all the time when we do POSTs.
      // The save succeeds anyway - print the success message in such a
      // case as to not confuse the user...
      if (res.status == 406) {
        success();
      } else {
        notifier.error(translations.error());
      }
    }

    function callSave(persister, name) {
      persister.saveData(success, error);
    }

    this.save = function() {
      $analytics.eventTrack('save', {
        category: 'actions', label: 'save'
      });

      if (self.needsSave) {
        notifier.wait(translations.inProgress());
        angular.forEach(persisters, callSave);
      } else {
        notifier.info(translations.nothingToSave());
      }
    };

    function defineKeyCaptures() {
      self.activeKeys = {};
      var keys = keyCapture.initCaptures(function(kC) {
        return {
          saver: [
            kC.create('save', function() { self.save(); }, 'ctrl-S')
          ]
        };
      });
      angular.extend(self.activeKeys, keys.saver);
    }

    function setChangeWatch() {
      state.on('tokenChange',  watchChange);
      state.on('tokenAdded',   watchChange);
      state.on('tokenRemoved', watchChange);
    }

    function watchChange() {
      self.needsSave = true;
    }

    // Don't let the user leave without a prompt, when
    // he's leaving when a save is needed.

    if (!state.debug) {
      // We need this when the user wants to reload, or move to another url
      // altogether.
      // Due to crappy browser support we cannot trigger a leave event after the
      // user does a confirmation of closing the application, which is something
      // we are OK with for now: When the user does not want to save before he
      // leaves, we will also do not trigger our event which will do further
      // cleanups, caching etc.
      $window.onbeforeunload = function(event) {
        if (self.needsSave) {
          return translations.confirmNote();
        } else {
          exitHandler.triggerLeaveEvent();
        }
      };

      // We need this when a user is changing the url from within the application
      $rootScope.$on('$locationChangeStart', function(event) {
        if (self.needsSave) {
          if (!$window.confirm(translations.confirmNote() + "\n" + translations.confirmQuestion())) {
            event.preventDefault();
          }
        }
      });

      // When we really leave, clean up on onbeforeunload event
      $rootScope.$on('destroy', function() { $window.onbeforeunload = undefined; });
    }

    this.onSuccess = function(cb) {
      $rootScope.$on(SUCCESS_EVENT, cb);
    };

    this.init = function(newPersisters) {
      defineKeyCaptures();
      reset();
      getPersistersAndOutputters();
      updateStatus();
      setChangeWatch();
    };
  }
]);
