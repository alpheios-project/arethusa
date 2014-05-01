"use strict";

describe('morph', function() {
  var mockState = {};
  var mockConfigurator = {
    conf_for: function(name) {
      return {};
    },
    getService: function(name) {
      return {};
    }
  };

  beforeEach(module('annotationApp', function($provide) {
    $provide.value('state', mockState);
    $provide.value('configurator', mockConfigurator);
  }));

  describe('this.seedAnalyses', function() {
    it('...', inject(function(morph, state, configurator) {
      var tokens = { '1' : { string: "Marcus" } };
      var result = { '1' : { string: "Marcus", forms: [], analyzed: false} };
      expect(morph.seedAnalyses(tokens)).toEqual(result);
    }));
  });
});
