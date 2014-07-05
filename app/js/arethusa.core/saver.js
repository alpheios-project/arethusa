"use strict";

angular.module('arethusa.core').service('saver', [
  'configurator',
  'notifier',
  'keyCapture',
  function(configurator, notifier, keyCapture) {
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
      if (hasPersisters()) {
        self.canSave = true;
      }
    }

    function reset() {
      self.canSave = false;
    }

    this.save = function() {
      notifier.info('Saving...');
      // We only have one persister right now, later we'll want
      // to handle the success notification better.
      angular.forEach(persisters, function(persister, name) {
        persister.saveData(function(data) {
          notifier.success('Document saved!');
        });
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
