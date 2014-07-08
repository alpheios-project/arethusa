"use strict";

angular.module('arethusa.artificialToken').service('artificialToken', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('artificialToken', self);
      self.model = new ArtificialToken();
    }

    configure();

    function ArtificialToken (string, type) {
      this.string = string;
      this.type   = type || 'elliptic';
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


    this.init = function() {
      configure();
    };
  }
]);
