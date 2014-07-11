'use strict';
angular.module('arethusa.text').service('text', [
  'state',
  'configurator',
  function (state, configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('text', self);
      self.hideArtificialTokens = false;
    }

    configure();

    function addRealToken(container, id, token) {
      if (!token.artificial) {
        container[id] = token;
      }
    }

    function removeRealToken(container, id, token) {
      if (!token.artificial) {
        delete container[id];
      }
    }

    function selectRealTokens() {
      return arethusaUtil.inject({}, state.tokens, addRealToken);
    }

    this.setTokens = function() {
      self.tokens = self.hideArtificialTokens ? selectRealTokens() : state.tokens;
    };

    // tokenAdded and tokenRemoved only have to do something, when
    // artificial tokens are hidden. Otherwise self.tokens is the
    // same as state.tokens anyway.
    state.on('tokenAdded', function(event, token) {
      if (self.hideArtificialTokens) {
        addRealToken(self.tokens, token.id, token);
      }
    });

    state.on('tokenRemoved', function(event, token) {
      if (self.hideArtificialTokens) {
        removeRealToken(self.tokens, token.id, token);
      }
    });

    this.init = function() {
      configure();
      self.setTokens();
    };
  }
]);
