'use strict';

describe('search', function() {
  var createTokens = function() {
    return {
      '01' : {
        id: '01',
        string: 'Arma'
      },
      '02': {
        id: '02',
        string: 'virum'
      },
      '03': {
        id: '03',
        string: 'virum'
      }
    };
  };

  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },

    getRetrievers: function(name) {
      return {};
    }
  };

  beforeEach(module('arethusa.core', function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  beforeEach(module('arethusa.search'));

  var search;
  var state;
  beforeEach(inject(function(_search_, _state_) {
    search = _search_;
    state = _state_;
    state.tokens = createTokens();
    search.init();
  }));

  describe('this.collectTokenStrings', function() {
    it('collects all strings of tokens as keys with their ids as values in an array', function() {
      var res = {'Arma': ['01'], 'virum': ['02', '03']};
      expect(search.collectTokenStrings()).toEqual(res);
    });
  });

  describe('this.pluginsWithSearch', function() {
    it('returns an array of plugins that have a search function', function() {
      var pluginA = { canSearch: true };
      var pluginB = { canSearch: false };
      var pluginC = { canSearch: true };
      var plugins = { "a": pluginA, "b": pluginB, "c": pluginC };
      expect(search.pluginsWithSearch(plugins)).toEqual([ pluginA, pluginC ]);
    });
  });
});
