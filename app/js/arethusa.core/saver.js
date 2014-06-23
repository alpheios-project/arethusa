"use strict";

angular.module('arethusa.core').service('saver', [
  'configurator',
  'notifier',
  function(configurator, notifier) {
    var self = this;
    var persisters;

    function getPersisters() {
      var persisterConf = configurator.configurationFor('main').persisters;
      persisters = configurator.getPersisters(persisterConf);
    }

    function updateStatus() {
      if (persisters) {
        self.canSave = true;
      }
    }

    function reset() {
      self.canSave = false;
    }

    this.save = function() {
      angular.forEach(persisters, function(persister, name) {
        persister.saveData(function(data) {
          notifier.success('Document saved!');
        });
      });
    };

    this.init = function(newPersisters) {
      reset();
      getPersisters();
      updateStatus();
    };
  }
]);
