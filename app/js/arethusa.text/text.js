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

    function selectRealTokens() {
      return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
        if (!token.artificial) {
          memo[id] = token;
        }
      });
    }

    function setTokens() {
      self.tokens = self.hideArtificialTokens ? selectRealTokens() : state.tokens;
    }

    this.init = function() {
      setTokens();
    };
  }
]);
