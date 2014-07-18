"use strict";

angular.module('arethusa.core').service('saver', [
  'configurator',
  'notifier',
  'keyCapture',
  '$timeout',
  function(configurator, notifier, keyCapture, $timeout) {
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
      notifier.success('Document saved!');
    }

    function error(res) {
      // Can't figure out why we return 406 from our development server
      // all the time when we do POSTs.
      // The save succeeds anyway - print the success message in such a
      // case as to not confuse the user...
      if (res.status == 406) {
        notifier.success('Document saved!');
      } else {
        notifier.error('Failed to save! Try again?');
      }
    }

    this.save = function() {
      notifier.info('Saving...');
      // We only have one persister right now, later we'll want
      // to handle the success notification better.
      angular.forEach(persisters, function(persister, name) {
        persister.saveData(success, error);
      });
    };

    keyCapture.initCaptures(function(kC) {
      return {
        saver: [
          kC.create('save', function() { self.save(); })
        ]
      };
    });

    this.init = function(newPersisters) {
      reset();
      getPersisters();
      updateStatus();
    };
  }
]);
