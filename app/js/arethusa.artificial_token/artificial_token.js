"use strict";

angular.module('arethusa.artificialToken').service('artificialToken', [
  'state',
  'configurator',
  'idHandler',
  function(state, configurator, idHandler) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('artificialToken', self);
      resetModel();
    }

    configure();

    function resetModel() {
      self.model = new ArtificialToken();
    }

    function ArtificialToken (string, type) {
      var self = this;
      this.string = string;
      this.type   = type || 'elliptic';
      this.artificial = true;
    }

    this.supportedTypes = [
      'elliptic'
    ];


    this.setType = function(type) {
      self.model.type = type;
    };

    this.hasType = function(type) {
      return self.model.type === type;
    };

    this.propagateToState = function() {
      state.addToken(self.model, idHandler.getId(1000));
      resetModel();
    };


    this.init = function() {
      configure();
    };
  }
]);
