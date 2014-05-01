"use strict";

describe('configurator', function() {
  beforeEach(function() {
    return module('arethusa');
  });

  describe('this.configurationFor', function() {
    xit('provides the configuration for a given plugin', inject(function(configurator) {
      // the configuration is usually provide from an external route
      configurator.configuration = { "text" : 'conf' };
      expect(configurator.configurationFor('text')).toEqual('conf');
    }));
  });
});
