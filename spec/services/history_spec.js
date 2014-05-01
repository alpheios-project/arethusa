"use strict";

describe('history', function() {
  var mockState = {};
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
  };

  beforeEach(module('arethusa', function($provide) {
    $provide.value('state', mockState);
    $provide.value('configurator', mockConfigurator);
  }));

  describe('...', function() {
    it('...', inject(function(history, state, configurator) {
    }));
  });
});
