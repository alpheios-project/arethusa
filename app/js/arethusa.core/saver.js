"use strict";

angular.module('arethusa.core').service('saver', [
  'configurator',
  'notifier',
  'keyCapture',
  'state',
  function(configurator, notifier, keyCapture, state) {
    var self = this;
    var persisters;

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
      notifier.success('Document saved!');
    }

    function error(res) {
      // Can't figure out why we return 406 from our development server
      // all the time when we do POSTs.
      // The save succeeds anyway - print the success message in such a
      // case as to not confuse the user...
      if (res.status == 406) {
        success();
      } else {
        notifier.error('Failed to save! Try again?');
      }
    }

    this.save = function() {
      if (self.needsSave) {
        notifier.info('Saving...');
        // We only have one persister right now, later we'll want
        // to handle the success notification better.
        angular.forEach(persisters, function(persister, name) {
          persister.saveData(success, error);
        });
      } else {
        notifier.info('Nothing to save yet!');
      }
    };

    this.activeKeys = {};
    var keys = keyCapture.initCaptures(function(kC) {
      return {
        saver: [
          kC.create('save', function() { self.save(); })
        ]
      };
    });
    angular.extend(self.activeKeys, keys.saver);

    var changeWatch;
    function setChangeWatch() {
      changeWatch = state.watch('*', function() {
        self.needsSave = true;
        changeWatch();
      });
    }

    this.init = function(newPersisters) {
      reset();
      getPersisters();
      updateStatus();
      setChangeWatch();
    };
  }
]);
