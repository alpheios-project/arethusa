'use strict';
angular.module('arethusa.text').service('text', [
  'state',
  'configurator',
  'navigator',
  'keyCapture',
  'commons',
  'userPreferences',
  function (state, configurator, navigator, keyCapture, commons, userPreferences) {
    var self = this;
    this.name = "text";

    var props = [
      'showContext'
    ];

    function configure() {
      configurator.getConfAndDelegate(self, props);
      self.hideArtificialTokens = false;
    }

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

    this.context = navigator.status.context;

    this.settings = [
      commons.setting('Show Context', 'showContext')
    ];

    function toggleContext() {
      var newVal = !self.showContext;
      userPreferences.set(self.name, 'showContext', newVal);
      self.showContext = newVal;
    }

    keyCapture.initCaptures(function(kC) {
      return {
        text: [
          kC.create('toggleContext', toggleContext, 'k')
        ]
      };
    });

    this.init = function() {
      configure();
      self.setTokens();
    };
  }
]);
