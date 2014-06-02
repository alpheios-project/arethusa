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
      },
      '04': {
        id: '04',
        string: 'cano'
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

  describe('this.findByRegex', function() {
    describe('finds tokens by a regex and returns their id in an array', function() {
      it('with simple regex', function() {
        var arg = 'um';
        expect(search.findByRegex(arg)).toEqual(['02', '03']);
      });
    });

    describe('with meta characters', function() {
      it('with .', function() {
        var arg = 'r.m';
        expect(search.findByRegex(arg)).toEqual(['02', '03']);
      });

      it('...', function() {
        // more tests to follow
      });
    });
  });

  describe('this.queryTokens', function() {
    describe('returns a multiselection', function() {
      it('with one search lemma', function() {
        search.tokenQuery = 'virum';
        var res = state.multiSelect(['02', '03']);
        expect(search.queryTokens()).toEqual(res);
      });

      it('with two search lemmata', function() {
        search.tokenQuery = 'Arma virum';
        var res = state.multiSelect(['01', '02', '03']);
        expect(search.queryTokens()).toEqual(res);
      });

      it('with a lemma and a regex', function() {
        search.tokenQuery = 'Arma v.*m';
        var res = state.multiSelect(['01', '02', '03']);
        expect(search.queryTokens()).toEqual(res);
      });
    });
  });

  describe('this.collectTokenStrings', function() {
    it('collects all strings of tokens as keys with their ids as values in an array', function() {
      var res = {'Arma': ['01'], 'virum': ['02', '03'], 'cano': ['04']};
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

  describe('this.init', function() {
    it('initializes the plugin by collecting all token strings and providing a model for input form', function() {
      search.init();
      var res = {'Arma': ['01'], 'virum': ['02', '03'], 'cano': ['04']};
      expect(search.strings).toEqual(res);
      expect(search.tokenQuery).toEqual('');
    });
  });
});
