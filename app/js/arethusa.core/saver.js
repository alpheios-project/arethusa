"use strict";

angular.module('arethusa.core').service('saver', [
  'configurator',
  'notifier',
  'keyCapture',
  'state',
  '$rootScope',
  '$window',
  'translator',
  function(configurator, notifier, keyCapture, state,
           $rootScope, $window, translator) {
    var self = this;
    var persisters;

    var translations = {};
    translator('saver.success', translations, 'success');
    translator('saver.error', translations, 'error');
    translator('saver.inProgress', translations, 'inProgress');
    translator('saver.nothingToSave', translations, 'nothingToSave');
    translator('saver.confirmNote', translations, 'confirmNote');
    translator('saver.confirmQuestion', translations, 'confirmQuestion');

    function getPersisters() {
      var persisterConf = configurator.configurationFor('main').persisters;
      persisters = configurator.getPersisters(persisterConf);
    }

    function hasPersisters(args) {
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

    function success(res) {
      self.needsSave = false;
      setChangeWatch();
      notifier.success(translations.success);
    }

    function error(res) {
      // Can't figure out why we return 406 from our development server
      // all the time when we do POSTs.
      // The save succeeds anyway - print the success message in such a
      // case as to not confuse the user...
      if (res.status == 406) {
        success();
      } else {
        notifier.error(translations.error);
      }
    }

    this.save = function() {
      if (self.needsSave) {
        notifier.wait(translations.inProgress);
        // We only have one persister right now, later we'll want
        // to handle the success notification better.
        angular.forEach(persisters, function(persister, name) {
          persister.saveData(success, error);
        });
      } else {
        notifier.info(translations.nothingToSave);
      }
    };

    this.activeKeys = {};
    var keys = keyCapture.initCaptures(function(kC) {
      return {
        saver: [
          kC.create('save', function() { self.save(); }, 'ctrl-S')
        ]
      };
    });
    angular.extend(self.activeKeys, keys.saver);

    var changeWatch;
    function setChangeWatch() {
      changeWatch = state.watch('*', watchChange);
      state.on('tokenAdded',   watchChange);
      state.on('tokenRemoved', watchChange);
    }

    function watchChange() {
      self.needsSave = true;
      unsetChangeWatch();
    }

    function unsetChangeWatch() {
      if (changeWatch) changeWatch();
      changeWatch = undefined;
    }

    // Don't let the user leave without a prompt, when
    // he's leaving when a save is needed.

    if (!state.debug) {
      // We need this when the user wants to reload, or move to another url
      // altogether.

      $window.onbeforeunload = function() {
        if (self.needsSave) { return translations.confirmNote; }
      };

      // We need this when a user is changing the url from within the application
      $rootScope.$on('$locationChangeStart', function(event) {
        if (self.needsSave) {
          if (!$window.confirm(translations.confirmNote + "\n" + translations.confirmQuestion)) {
            event.preventDefault();
          }
        }
      });

      // When we really leave, clean up on onbeforeunload event
      $rootScope.$on('destroy', function() { $window.onbeforeunload = undefined; });
    }

    this.init = function(newPersisters) {
      reset();
      getPersisters();
      updateStatus();
      setChangeWatch();
    };
  }
]);
