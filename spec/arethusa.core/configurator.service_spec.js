"use strict";

describe('configurator', function() {
  var mock1 = {};
  var mock2 = {};
  beforeEach(module('arethusa', function($provide) {
    $provide.value('x', mock1);
    $provide.value('y', mock2);
  }));

  describe('this.configurationFor', function() {
    it('provides the configuration for a given plugin', inject(function(configurator) {
      // the configuration is usually provide from an external route
      configurator.configuration = { "text" : 'conf' };
      expect(configurator.configurationFor('text')).toEqual('conf');
    }));
  });

  describe('this.getService', function() {
    it('retrieves an angular instance by name', inject(function(configurator) {
      expect(configurator.getService('x')).toEqual(mock1);
    }));
  });

  describe('this.getServices', function() {
    it('retrieves an object of angular instances by name', inject(function(configurator) {
      var names = ['x', 'y'];
      var services = configurator.getServices(names);
      expect(services).toEqual({ 'x' : mock1, 'y' : mock2 });
    }));

    it('returns an empty array when no service names are given', inject(function(configurator) {
      var services = configurator.getServices(undefined);
      expect(services).toEqual([]);
    }));
  });
});
