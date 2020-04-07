'use strict';

describe('api', function() {
  var api, state;

  beforeEach(function() {
    module('arethusa.core', function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
    });

    inject(function(_api_, _state_) {
      api = _api_;
      state = _state_;
      state.tokens = arethusaMocks.tokens();
    });
  });

  describe('this.findWord', function() {
  
    xit('finds a word with prefix and suffix', function() {
      //var ids = api.findWord('virum','Arma','-que');
      expect(api).toBeTruthy();
      expect(api.findWord('a','b','c')).toEqual(['']);
    });

  });
});
