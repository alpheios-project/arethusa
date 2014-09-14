"use strict";

angular.module('arethusa.similes').service('similes', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'similes';


    this.labelAs = "long";
    this.defineAncestors = true;

    this.defaultConf = {
      template: 'templates/arethusa.similes/similes.html'
    };

    var props = [
      'relations' // change this to whatever needed later
    ];

    function configure() {
      configurator.getConfAndDelegate(self, props);
      self.similes = self.relations.labels;
    }

    this.currentSelection = function() {
      return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, token) {
        memo[id] = self.interal[id];
      });
    };

    function createInternalState() {
      self.interal = arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
        memo[id] = {};
      });
    }

    this.init = function() {
      configure();
      createInternalState();
    };
  }
]);
